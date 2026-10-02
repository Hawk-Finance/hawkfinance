"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { amountToInput, formatApy, formatToken, formatUsd, parseAmount } from "@/lib/protocol/format";
import { useWallet } from "@/lib/wallet";
import { AmountInput } from "./amount-input";
import { PercentageSelector } from "./percentage-selector";

export function TransactionPanel({
  side,
  symbol,
  price,
  apy,
  balance,
  available,
  maxAmount,
  note,
  canSubmit,
  sight,
}: {
  side: "supply" | "borrow";
  symbol: string;
  price: number;
  apy: number;
  balance: number | null;
  available: number | null;
  maxAmount: number | null;
  note?: string | null;
  canSubmit: boolean;
  sight?: (amount: number) => React.ReactNode;
}) {
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [needPreview, setNeedPreview] = useState(false);
  const parsed = parseAmount(amount) ?? 0;
  const overMax = parsed > 0 && maxAmount != null && parsed > maxAmount + 1e-8;
  const error = overMax ? (side === "supply" ? "Exceeds wallet balance" : "Above borrow limit") : null;

  function selectPercent(id: "25" | "50" | "max") {
    if (maxAmount == null) return;
    const ratio = id === "25" ? 0.25 : id === "50" ? 0.5 : 1;
    setAmount(amountToInput(maxAmount * ratio));
    setActive(id);
    setNotice(null);
  }

  async function submit() {
    if (wallet.status === "disconnected") {
      const result = await wallet.connect();
      if (result === "no-wallet") setNeedPreview(true);
      return;
    }
    if (wallet.status === "wrong-network") {
      await wallet.switchChain();
      return;
    }
    if (!wallet.hawk) {
      setNotice("Open the Hawk wallet to move these markets.");
      return;
    }
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/tx", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ side, symbol, amount }),
      });
      const body = (await response.json()) as { hash?: string; error?: string };
      if (!response.ok || !body.hash) {
        setNotice(body.error ?? "Transaction failed.");
        return;
      }
      setAmount("");
      setActive(null);
      setNotice(`Confirmed ${body.hash.slice(0, 10)}…`);
      await wallet.refresh();
    } catch {
      setNotice("Transaction failed.");
    } finally {
      setPending(false);
    }
  }

  const cta =
    wallet.status === "connecting"
      ? "Connecting"
      : wallet.status === "wrong-network"
        ? "Switch to Robinhood Chain"
        : wallet.status === "disconnected"
          ? "Connect Wallet"
            : pending
            ? "Confirming"
            : side === "supply"
              ? `Supply ${symbol}`
              : `Borrow ${symbol}`;

  const ready = wallet.status === "connected" && canSubmit && parsed > 0 && !overMax && !pending;

  return (
    <form
      className="lg:border-l lg:border-line lg:pl-10"
      onSubmit={(event) => {
        event.preventDefault();
        if (wallet.status !== "connected") {
          void submit();
          return;
        }
        if (!ready) return;
        void submit();
      }}
    >
      <h2 className="text-[28px] tracking-[-0.03em] text-ivory">
        {side === "supply" ? "Supply" : "Borrow"} {symbol}
      </h2>
      <dl className="mt-6 space-y-3 text-[14px]">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Wallet Balance</dt>
          <dd className="tabular-nums text-ivory">{balance == null ? "—" : formatToken(balance)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">{side === "supply" ? "Available" : "Available to borrow"}</dt>
          <dd className="tabular-nums text-ivory">
            {available == null ? "—" : side === "supply" ? formatUsd(available) : formatToken(available)}
          </dd>
        </div>
      </dl>

      {sight ? <div className="mt-8 border-t border-line-subtle pt-6">{sight(parsed)}</div> : null}

      <div className="mt-8">
        <AmountInput
          id={`${side}-${symbol}-amount`}
          symbol={symbol}
          value={amount}
          onChange={(value) => {
            setAmount(value);
            setActive(null);
            setNotice(null);
          }}
        />
      </div>
      <div className="mt-4">
        <PercentageSelector active={active} disabled={maxAmount == null || maxAmount <= 0} onSelect={selectPercent} />
      </div>

      <dl className="mt-8 space-y-3 border-t border-line-subtle pt-5 text-[14px]">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">{side === "supply" ? "Supply APY" : "Borrow APY"}</dt>
          <dd className={cn("tabular-nums", side === "supply" ? "text-lime" : "text-ivory")}>{formatApy(apy)}</dd>
        </div>
        {side === "supply" ? (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">Estimated earnings</dt>
            <dd className="tabular-nums text-ivory">
              {parsed > 0 ? `${formatUsd(parsed * price * apy, "exact")} / year` : "—"}
            </dd>
          </div>
        ) : null}
      </dl>

      {note ? <p className="mt-5 text-[13px] leading-relaxed text-secondary">{note}</p> : null}
      {error ? <p className="mt-3 text-[13px] text-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-[13px] text-secondary">{notice}</p> : null}
      {needPreview ? (
        <button
          type="button"
          onClick={() => {
            wallet.startPreview();
            setNeedPreview(false);
          }}
          className="mt-4 text-[13px] text-lime"
        >
          Continue with a preview wallet
        </button>
      ) : null}

      <button
        type="submit"
        disabled={wallet.status === "connecting" || pending || (wallet.status === "connected" && !ready)}
        className="mt-6 w-full bg-lime px-5 py-3.5 text-[14px] font-medium text-canvas transition-colors duration-200 hover:bg-[#d4ff71] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-lime"
      >
        {cta}
      </button>
    </form>
  );
}
