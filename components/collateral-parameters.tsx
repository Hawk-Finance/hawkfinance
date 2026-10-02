import { formatPercent, formatUsd } from "@/lib/protocol/format";
import type { Market } from "@/lib/protocol/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line-subtle py-3.5">
      <dt className="text-[14px] text-secondary">{label}</dt>
      <dd className="text-right text-[14px] tabular-nums text-ivory">{value}</dd>
    </div>
  );
}

export function CollateralParameters({ market }: { market: Market }) {
  return (
    <div>
      <h2 className="text-[13px] tracking-[0.16em] text-muted uppercase">Collateral Parameters</h2>
      <dl className="mt-2">
        <Row label="LTV" value={formatPercent(market.ltv, 0)} />
        <Row label="Liquidation Threshold" value={formatPercent(market.liquidationThreshold, 0)} />
        <Row label="Liquidation Penalty" value={formatPercent(market.liquidationPenalty, 0)} />
        <Row label="Supply Cap" value={formatUsd(market.supplyCapUsd)} />
        <Row label="Borrow Cap" value={formatUsd(market.borrowCapUsd)} />
      </dl>
      <div className="mt-10">
        <h2 className="text-[13px] tracking-[0.16em] text-muted uppercase">Risk Parameters</h2>
        <dl className="mt-2">
          <Row label="Liquidity Depth" value={market.liquidityDepth} />
          <Row label="Oracle Status" value={market.oracleStatus} />
        </dl>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-secondary">
          Loan-to-value is set for a thin book. The oracle is guarded against stale or abrupt prints.
        </p>
      </div>
    </div>
  );
}
