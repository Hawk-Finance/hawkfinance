"use client";

import { cn } from "@/lib/cn";
import { balanceOf } from "@/lib/protocol/account";
import { useWallet } from "@/lib/wallet";
import { MarketRow } from "./market-row";

const HEADERS = {
  overview: ["Asset", "Total Supplied", "Available", "Supply APY", "Borrow APY", "LTV", "Utilization"],
  supply: ["Asset", "Wallet Balance", "Total Supplied", "Supply APY", "Utilization"],
  borrow: ["Asset", "Available", "Borrow APY", "LTV", "Utilization"],
};

export function MarketTable({
  variant,
  selected,
  onSelect,
}: {
  variant: "overview" | "supply" | "borrow";
  selected?: string;
  onSelect?: (symbol: string) => void;
}) {
  const wallet = useWallet();
  const markets = wallet.markets;
  const headers = HEADERS[variant];
  const grid =
    variant === "overview"
      ? "grid-cols-[minmax(280px,1.7fr)_repeat(6,minmax(88px,1fr))_28px]"
      : "grid-cols-[minmax(180px,1.6fr)_repeat(4,minmax(96px,1fr))_88px]";

  return (
    <div className="overflow-x-auto">
      <div className={cn("min-w-[1040px]", variant !== "overview" && "min-w-[760px]")}>
        <div className={cn("grid items-center border-b border-[rgba(241,240,234,0.08)] px-2 pb-3", grid)}>
          {headers.map((header, index) => (
            <span
              key={header}
              className={cn(
                "text-[10px] tracking-[0.16em] text-muted uppercase",
                index === 0 ? "text-left" : "text-right",
              )}
            >
              {header}
            </span>
          ))}
          <span className="sr-only">Open</span>
        </div>
        <div>
          {markets.map((market) => (
            <MarketRow
              key={market.symbol}
              market={market}
              variant={variant}
              balance={balanceOf(wallet.account, market.symbol)}
              selected={selected?.toLowerCase() === market.symbol.toLowerCase()}
              href={variant === "overview" ? `/markets/${market.symbol.toLowerCase()}` : undefined}
              onSelect={onSelect ? () => onSelect(market.symbol) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
