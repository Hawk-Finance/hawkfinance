"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { balanceOf } from "@/lib/protocol/account";
import { formatApy, formatPercent, formatUsd } from "@/lib/protocol/format";
import { availableUsd, getMarket, listMarkets, utilization } from "@/lib/protocol/markets";
import { useWallet } from "@/lib/wallet";
import { MarketLabels } from "./market-row";
import { MarketTable } from "./market-table";
import { PageHeader } from "./page-header";
import { Shell } from "./shell";
import { TransactionPanel } from "./transaction-panel";

export function SupplyWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const wallet = useWallet();
  const initial = params.get("asset") ?? "PONS";
  const [symbol, setSymbol] = useState(initial);
  const market =
    wallet.markets.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase()) ??
    getMarket(symbol) ??
    listMarkets()[0];
  const balance = balanceOf(wallet.account, market.symbol);

  const facts = useMemo(
    () => [
      { label: "Total Supplied", value: formatUsd(market.suppliedUsd) },
      { label: "Total Borrowed", value: formatUsd(market.borrowedUsd) },
      { label: "Available", value: formatUsd(availableUsd(market)) },
      { label: "Utilization", value: formatPercent(utilization(market)) },
      { label: "Supply APY", value: formatApy(market.supplyApy) },
      { label: "LTV", value: formatPercent(market.ltv, 0) },
    ],
    [market],
  );

  function select(next: string) {
    setSymbol(next);
    router.replace(`/supply?asset=${next.toLowerCase()}`, { scroll: false });
  }

  return (
    <Shell className="py-12 lg:py-16">
      <PageHeader title="Supply" subtitle="Put idle assets to work." />
      <MarketTable variant="supply" selected={market.symbol} onSelect={select} />
      <div className="mt-12 grid gap-12 border-t border-line pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="text-[13px] text-secondary">
            {market.name}
            <MarketLabels labels={market.labels} />
          </p>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-secondary">{market.summary}</p>
          <dl className="mt-8 max-w-md">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-6 border-b border-line-subtle py-3.5">
                <dt className="text-[14px] text-muted">{fact.label}</dt>
                <dd className={fact.label === "Supply APY" ? "tabular-nums text-lime" : "tabular-nums text-ivory"}>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <TransactionPanel
          key={market.symbol}
          side="supply"
          symbol={market.symbol}
          price={market.price}
          apy={market.supplyApy}
          balance={balance}
          available={availableUsd(market)}
          maxAmount={balance}
          canSubmit={balance != null && balance > 0}
          note={market.isolated ? "Supply stays inside this isolated market." : null}
        />
      </div>
    </Shell>
  );
}
