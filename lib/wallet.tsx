"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAddress, type Address } from "viem";
import { robinhoodChain, ROBINHOOD_CHAIN_ID, toHexChainId } from "./chains";
import { deployed } from "./protocol/deployed";
import { emptyAccount, previewAccount } from "./protocol/account";
import { listMarkets } from "./protocol/markets";
import type { AccountSnapshot, Market } from "./protocol/types";

export type WalletStatus = "disconnected" | "connecting" | "connected" | "wrong-network";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type WalletContextValue = {
  status: WalletStatus;
  address: Address | null;
  preview: boolean;
  hawk: boolean;
  live: boolean;
  markets: Market[];
  error: string | null;
  account: AccountSnapshot | null;
  connect: () => Promise<"connected" | "no-wallet" | "declined">;
  disconnect: () => void;
  switchChain: () => Promise<void>;
  startPreview: () => void;
  startHawk: () => void;
  refresh: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function getProvider() {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

async function readChainId(provider: EthereumProvider) {
  const hex = (await provider.request({ method: "eth_chainId" })) as string;
  return Number.parseInt(hex, 16);
}

async function ensureChain(provider: EthereumProvider) {
  const chainId = toHexChainId(ROBINHOOD_CHAIN_ID);
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902 && code !== -32603) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId,
          chainName: robinhoodChain.name,
          nativeCurrency: robinhoodChain.nativeCurrency,
          rpcUrls: [...robinhoodChain.rpcUrls.default.http],
          blockExplorerUrls: [robinhoodChain.blockExplorers.default.url],
        },
      ],
    });
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [address, setAddress] = useState<Address | null>(null);
  const [preview, setPreview] = useState(false);
  const [hawk, setHawk] = useState(false);
  const [live, setLive] = useState(false);
  const [markets, setMarkets] = useState<Market[]>(() =>
    listMarkets().map((market) => ({ ...market, suppliedUsd: 0, borrowedUsd: 0 })),
  );
  const [chainAccount, setChainAccount] = useState<AccountSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyProviderAccount = useCallback(async (provider: EthereumProvider, nextAddress: Address) => {
    const chainId = await readChainId(provider);
    setAddress(nextAddress);
    setPreview(false);
    setHawk(false);
    setStatus(chainId === ROBINHOOD_CHAIN_ID ? "connected" : "wrong-network");
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;
    let alive = true;

    void (async () => {
      const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
      if (!alive || !accounts?.length) return;
      await applyProviderAccount(provider, getAddress(accounts[0]));
    })();

    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts?.length) {
        setAddress(null);
        setPreview(false);
        setHawk(false);
        setStatus("disconnected");
        return;
      }
      void applyProviderAccount(provider, getAddress(accounts[0]));
    };
    const onChain = (...args: unknown[]) => {
      const chainId = Number.parseInt(args[0] as string, 16);
      setStatus((current) => {
        if (current === "disconnected") return current;
        return chainId === ROBINHOOD_CHAIN_ID ? "connected" : "wrong-network";
      });
    };

    provider.on?.("accountsChanged", onAccounts);
    provider.on?.("chainChanged", onChain);
    return () => {
      alive = false;
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, [applyProviderAccount]);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return "no-wallet" as const;
    setStatus("connecting");
    setError(null);
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      if (!accounts?.length) throw new Error("No account authorized.");
      await ensureChain(provider);
      await applyProviderAccount(provider, getAddress(accounts[0]));
      return "connected" as const;
    } catch {
      setStatus("disconnected");
      setAddress(null);
      setError("Connection declined");
      return "declined" as const;
    }
  }, [applyProviderAccount]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setPreview(false);
    setHawk(false);
    setError(null);
    setStatus("disconnected");
  }, []);

  const switchChain = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;
    setError(null);
    try {
      await ensureChain(provider);
      setStatus("connected");
    } catch {
      setError("Network switch declined");
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/state");
      const body = (await response.json()) as {
        live?: boolean;
        markets?: Market[];
        account?: AccountSnapshot;
      };
      if (!body.live || !body.markets || !body.account) {
        setLive(false);
        return;
      }
      setLive(true);
      setMarkets(body.markets);
      setChainAccount(body.account);
    } catch {
      setLive(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  const startPreview = useCallback(() => {
    setAddress(previewAccount().address);
    setPreview(true);
    setHawk(false);
    setError(null);
    setStatus("connected");
  }, []);

  const startHawk = useCallback(() => {
    setAddress(getAddress(deployed.wallet));
    setPreview(false);
    setHawk(true);
    setError(null);
    setStatus("connected");
    void refresh();
  }, [refresh]);

  const account = useMemo(() => {
    if (!address || (status !== "connected" && status !== "wrong-network")) return null;
    if (hawk) return chainAccount ?? emptyAccount(address);
    return preview ? previewAccount() : emptyAccount(address);
  }, [address, chainAccount, hawk, preview, status]);

  const value = useMemo(
    () => ({
      status,
      address,
      preview,
      hawk,
      live,
      markets,
      error,
      account,
      connect,
      disconnect,
      switchChain,
      startPreview,
      startHawk,
      refresh,
    }),
    [status, address, preview, hawk, live, markets, error, account, connect, disconnect, switchChain, startPreview, startHawk, refresh],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used within WalletProvider");
  return value;
}
