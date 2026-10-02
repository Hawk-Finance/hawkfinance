import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  maxUint256,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { robinhoodChain } from "../chains";
import { deployed, type DeployedSymbol } from "./deployed";
import { MARKETS } from "./markets";
import type { AccountSnapshot, Market } from "./types";

const rpc = "https://rpc.mainnet.chain.robinhood.com";

const symbolByToken = new Map(
  Object.entries(deployed.tokens).map(([symbol, address]) => [address.toLowerCase(), symbol]),
);

const poolAbi = [
  {
    type: "function",
    name: "marketCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenAt",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "marketOf",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      { name: "price", type: "uint256" },
      { name: "ltvBps", type: "uint16" },
      { name: "liqBps", type: "uint16" },
      { name: "penaltyBps", type: "uint16" },
      { name: "supplyAprBps", type: "uint16" },
      { name: "borrowAprBps", type: "uint16" },
      { name: "totalSupply", type: "uint256" },
      { name: "totalBorrow", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "positionOf",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [
      { name: "suppliedAmount", type: "uint256" },
      { name: "borrowedAmount", type: "uint256" },
      { name: "enabled", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "supply",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const tokenAbi = [
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

function client() {
  return createPublicClient({
    chain: robinhoodChain,
    transport: http(rpc, { timeout: 20_000 }),
  });
}

function amount(value: bigint) {
  return Number(formatUnits(value, 18));
}

export async function readProtocol(): Promise<{ markets: Market[]; account: AccountSnapshot } | null> {
  try {
    const publicClient = client();
    const count = Number(
      await publicClient.readContract({
        address: deployed.pool,
        abi: poolAbi,
        functionName: "marketCount",
      }),
    );
    const tokens = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        publicClient.readContract({
          address: deployed.pool,
          abi: poolAbi,
          functionName: "tokenAt",
          args: [BigInt(index)],
        }),
      ),
    );
    const rows = await Promise.all(
      tokens.map(async (token) => {
        const symbol = symbolByToken.get(token.toLowerCase());
        if (!symbol) return null;
        const [market, balance, position] = await Promise.all([
          publicClient.readContract({ address: deployed.pool, abi: poolAbi, functionName: "marketOf", args: [token] }),
          publicClient.readContract({
            address: token,
            abi: tokenAbi,
            functionName: "balanceOf",
            args: [deployed.wallet],
          }),
          publicClient.readContract({
            address: deployed.pool,
            abi: poolAbi,
            functionName: "positionOf",
            args: [deployed.wallet, token],
          }),
        ]);
        return { symbol, market, balance, position };
      }),
    );
    const listed = rows.filter((row): row is NonNullable<typeof row> => row != null);

    const markets = listed.map((row) => {
      const base = MARKETS.find((market) => market.symbol === row.symbol);
      const price = amount(row.market[0]);
      const supplied = amount(row.market[6]);
      const borrowed = amount(row.market[7]);
      return {
        symbol: row.symbol,
        name: base?.name ?? row.symbol,
        decimals: 18,
        price,
        labels: base?.labels ?? [],
        isolated: false,
        suppliedUsd: supplied * price,
        borrowedUsd: borrowed * price,
        supplyApy: Number(row.market[4]) / 10_000,
        borrowApy: Number(row.market[5]) / 10_000,
        ltv: Number(row.market[1]) / 10_000,
        liquidationThreshold: Number(row.market[2]) / 10_000,
        liquidationPenalty: Number(row.market[3]) / 10_000,
        supplyCapUsd: base?.supplyCapUsd ?? 0,
        borrowCapUsd: base?.borrowCapUsd ?? 0,
        oracleStatus: base?.oracleStatus ?? "Guarded",
        liquidityDepth: base?.liquidityDepth ?? "Thin",
        summary: base?.summary ?? "",
      } satisfies Market;
    });

    const account: AccountSnapshot = {
      address: deployed.wallet,
      preview: false,
      balances: {},
      supplies: [],
      borrows: [],
      collateral: [],
    };
    for (const row of listed) {
      const walletBalance = amount(row.balance);
      const supplied = amount(row.position[0]);
      const borrowed = amount(row.position[1]);
      account.balances[row.symbol] = walletBalance;
      if (supplied > 0) account.supplies.push({ symbol: row.symbol, amount: supplied });
      if (borrowed > 0) account.borrows.push({ symbol: row.symbol, amount: borrowed });
      if (supplied > 0) {
        account.collateral.push({ symbol: row.symbol, amount: supplied, enabled: row.position[2] });
      }
    }
    return { markets, account };
  } catch {
    return null;
  }
}

export async function sendMarketAction(side: "supply" | "borrow", symbol: string, rawAmount: string) {
  const key = process.env.HAWK_WALLET_PRIVATE_KEY;
  if (!key?.startsWith("0x")) throw new Error("Hawk wallet is not configured.");
  if (!/^\d+(\.\d+)?$/.test(rawAmount) || Number(rawAmount) <= 0) throw new Error("Enter an amount.");
  const token = deployed.tokens[symbol as DeployedSymbol];
  if (!token) throw new Error("Unknown market.");
  const account = privateKeyToAccount(key as `0x${string}`);
  const publicClient = client();
  const value = parseUnits(rawAmount, 18);
  const wallet = createWalletClient({
    account,
    chain: robinhoodChain,
    transport: http(rpc, { timeout: 20_000 }),
  });
  if (side === "supply") {
    const balance = await publicClient.readContract({
      address: token,
      abi: tokenAbi,
      functionName: "balanceOf",
      args: [account.address],
    });
    if (balance < value) throw new Error(`The Hawk wallet does not hold enough ${symbol}.`);
    const allowance = await publicClient.readContract({
      address: token,
      abi: tokenAbi,
      functionName: "allowance",
      args: [account.address, deployed.pool],
    });
    if (allowance < value) {
      const approval = await wallet.writeContract({
        address: token,
        abi: tokenAbi,
        functionName: "approve",
        args: [deployed.pool, maxUint256],
      });
      const approved = await publicClient.waitForTransactionReceipt({ hash: approval });
      if (approved.status !== "success") throw new Error("Approval failed.");
    }
  }
  const hash = await wallet.writeContract({
    address: deployed.pool,
    abi: poolAbi,
    functionName: side,
    args: [token, value],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("The transaction reverted.");
  return hash;
}
