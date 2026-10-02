import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AssetIcon } from "@/components/asset-icon";
import { CollateralParameters } from "@/components/collateral-parameters";
import { MarketLabels } from "@/components/market-row";
import { Shell } from "@/components/shell";
import { formatApy, formatPercent, formatUsd } from "@/lib/protocol/format";
import { readProtocol } from "@/lib/protocol/chain";
import { availableUsd, getMarket, listMarkets, utilization } from "@/lib/protocol/markets";

type Params = { symbol: string };

export function generateStaticParams() {
  return listMarkets().map((market) => ({ symbol: market.symbol.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { symbol } = await params;
  const market = getMarket(symbol);
  if (!market) return { title: "Market" };
  return {
    title: `${market.symbol} Market`,
    description: market.summary,
  };
}

export default async function MarketDetailPage({ params }: { params: Promise<Params> }) {
  const { symbol } = await params;
  const listed = getMarket(symbol);
  if (!listed) notFound();
  const live = await readProtocol();
  const market = live?.markets.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase()) ?? listed;

  const metrics = [
    { label: "Supply APY", value: formatApy(market.supplyApy), lime: true },
    { label: "Borrow APY", value: formatApy(market.borrowApy), lime: false },
    { label: "Total Supplied", value: formatUsd(market.suppliedUsd), lime: false },
    { label: "Total Borrowed", value: formatUsd(market.borrowedUsd), lime: false },
    { label: "Available Liquidity", value: formatUsd(availableUsd(market)), lime: false },
    { label: "Utilization", value: formatPercent(utilization(market)), lime: false },
  ];

  return (
    <Shell className="py-12 lg:py-16">
      <p className="text-[11px] tracking-[0.22em] text-muted">MARKET</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <AssetIcon symbol={market.symbol} />
        <h1 className="text-[44px] leading-none tracking-[-0.035em] sm:text-[56px]">{market.symbol} Market</h1>
        <MarketLabels labels={market.labels} />
      </div>
      <p className="mt-4 flex items-center gap-2 text-[13px] tracking-[0.16em] text-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-lime" />
        ACTIVE
      </p>
      <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-secondary">{market.summary}</p>

      <div className="mt-12 grid grid-cols-2 border-y border-line md:grid-cols-3">
        {metrics.map((metric, index) => (
          <div key={metric.label} className={["px-1 py-6 md:px-6", index % 2 === 1 ? "border-l border-line" : "", index % 3 !== 0 ? "md:border-l md:border-line" : "md:border-l-0"].join(" ")}>
            <p className="text-[10px] tracking-[0.16em] text-muted uppercase">{metric.label}</p>
            <p className={metric.lime ? "mt-3 text-[28px] tabular-nums text-lime" : "mt-3 text-[28px] tabular-nums text-ivory"}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-14 lg:grid-cols-2">
        <div>
          <h2 className="text-[13px] tracking-[0.16em] text-muted uppercase">Market Overview</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-secondary">
            {market.name} on Robinhood Chain. Oracle status is {market.oracleStatus.toLowerCase()}. Liquidity depth is{" "}
            {market.liquidityDepth.toLowerCase()}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/supply?asset=${market.symbol.toLowerCase()}`} className="inline-flex items-center gap-2 bg-lime px-5 py-3 text-[14px] font-medium text-canvas">
              Supply {market.symbol}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href={`/borrow?asset=${market.symbol.toLowerCase()}`} className="inline-flex items-center gap-2 border border-[rgba(241,240,234,0.28)] px-5 py-3 text-[14px] text-ivory">
              Borrow {market.symbol}
            </Link>
          </div>
        </div>
        <CollateralParameters market={market} />
      </div>
    </Shell>
  );
}
