import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatToken, formatUsd } from "@/lib/protocol/format";
import { availableUsd, utilization } from "@/lib/protocol/markets";
import type { Market, MarketLabel } from "@/lib/protocol/types";
import { APYValue } from "./apy-value";
import { AssetIcon } from "./asset-icon";

function Label({ label }: { label: MarketLabel }) {
  return (
    <span className="border border-[rgba(241,240,234,0.16)] px-1.5 py-px text-[9px] tracking-[0.14em] text-muted">
      {label}
    </span>
  );
}

export function MarketLabels({ labels }: { labels: MarketLabel[] }) {
  if (!labels.length) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 align-middle">
      {labels.map((label) => (
        <Label key={label} label={label} />
      ))}
    </span>
  );
}

function AssetCell({ market, compact }: { market: Market; compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <AssetIcon symbol={market.symbol} />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center">
          <span className="text-[14px] font-medium text-ivory">{market.symbol}</span>
          <MarketLabels labels={market.labels} />
        </span>
        {compact ? (
          <span className="sr-only">{market.name}</span>
        ) : (
          <span className="mt-0.5 block text-[12px] text-muted">{market.name}</span>
        )}
      </span>
    </span>
  );
}

export function MarketRow({
  market,
  variant,
  balance,
  selected,
  href,
  onSelect,
}: {
  market: Market;
  variant: "overview" | "supply" | "borrow";
  balance: number | null;
  selected?: boolean;
  href?: string;
  onSelect?: () => void;
}) {
  const cells = rowCells(market, variant, balance);
  const className = cn(
    "group grid h-16 w-full items-center border-b border-line-subtle px-2 text-left transition-colors duration-200 hover:bg-[rgba(241,240,234,0.035)]",
    selected && "bg-[rgba(241,240,234,0.04)] shadow-[inset_2px_0_0_#C8FF4D]",
    variant === "overview" ? "grid-cols-[minmax(280px,1.7fr)_repeat(6,minmax(88px,1fr))_28px]" : "grid-cols-[minmax(180px,1.6fr)_repeat(4,minmax(96px,1fr))_88px]",
  );

  const content = (
    <>
      <AssetCell market={market} compact={variant === "overview"} />
      {cells.map((cell) => (
        <span key={cell.key} className={cn("text-right text-[14px] tabular-nums text-ivory", cell.className)}>
          {cell.node}
        </span>
      ))}
      <span className="flex justify-end text-secondary">
        {variant === "overview" ? (
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.25} />
        ) : (
          <span className="inline-flex items-center gap-1 text-[13px] text-ivory">
            {variant === "supply" ? "Supply" : "Borrow"}
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.25} />
          </span>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onSelect} className={className} aria-pressed={selected}>
      {content}
    </button>
  );
}

function rowCells(market: Market, variant: "overview" | "supply" | "borrow", balance: number | null) {
  const util = utilization(market);
  const utilNode = <span className="text-secondary">{(util * 100).toFixed(1)}%</span>;
  const ltvNode = <span className="text-secondary">{Math.round(market.ltv * 100)}%</span>;

  if (variant === "supply") {
    return [
      { key: "balance", node: balance == null ? "—" : formatToken(balance), className: "text-secondary" },
      { key: "supplied", node: formatUsd(market.suppliedUsd) },
      { key: "supply", node: <APYValue apy={market.supplyApy} tone="lime" /> },
      { key: "util", node: utilNode },
    ];
  }

  if (variant === "borrow") {
    return [
      { key: "available", node: formatUsd(availableUsd(market)), className: "text-secondary" },
      { key: "borrow", node: <APYValue apy={market.borrowApy} /> },
      { key: "ltv", node: ltvNode },
      { key: "util", node: utilNode },
    ];
  }

  return [
    { key: "supplied", node: formatUsd(market.suppliedUsd) },
    { key: "available", node: formatUsd(availableUsd(market)), className: "text-secondary" },
      { key: "supply", node: <APYValue apy={market.supplyApy} tone="yield" /> },
      { key: "borrow", node: <APYValue apy={market.borrowApy} tone="muted" /> },
    { key: "ltv", node: ltvNode },
    { key: "util", node: utilNode },
  ];
}
