"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { balanceOf, quoteBorrow } from "@/lib/protocol/account";
import { formatApy, formatPercent, formatToken, formatUsd } from "@/lib/protocol/format";
import { getMarket, listMarkets } from "@/lib/protocol/markets";
import { useWallet } from "@/lib/wallet";
import { HawkSight } from "./hawk-sight";
import { MarketLabels } from "./market-row";
import { MarketTable } from "./market-table";
import { PageHeader } from "./page-header";
import { Shell } from "./shell";
import { TransactionPanel } from "./transaction-panel";

export function BorrowWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const wallet = useWallet();
  const initial = params.get("asset") ?? "ROUTE";
  const [symbol, setSymbol] = useState(initial);
  const market =
    wallet.markets.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase()) ??
    getMarket(symbol) ??
    listMarkets()[0];
  const quote = quoteBorrow(wallet.account, market, 0);
  const maxAmount = market.price > 0 ? quote.available / market.price : 0;

  function select(next: string) {
    setSymbol(next);
    router.replace(`/borrow?asset=${next.toLowerCase()}`, { scroll: false });
  }

  const facts = [
    { label: "Collateral", value: quote.collateralLabel },
    { label: "Collateral value", value: formatUsd(quote.collateralValue, "exact") },
    { label: "Borrow limit", value: formatUsd(quote.borrowLimit, "exact") },
    { label: "Available to borrow", value: formatToken(maxAmount) },
    { label: "Borrow APY", value: formatApy(market.borrowApy) },
    { label: "Liquidation threshold", value: formatPercent(quote.liquidationThreshold, 0) },
  ];

  return (
    <Shell className="py-12 lg:py-16">
      <PageHeader title="Borrow" subtitle="Unlock liquidity without leaving your position." />
      <MarketTable variant="borrow" selected={market.symbol} onSelect={select} />
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
                <dd className="text-right tabular-nums text-ivory">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <TransactionPanel
          key={market.symbol}
          side="borrow"
          symbol={market.symbol}
          price={market.price}
          apy={market.borrowApy}
          balance={balanceOf(wallet.account, market.symbol)}
          available={maxAmount}
          maxAmount={wallet.account ? maxAmount : null}
          canSubmit={!market.isolated && quote.collateralValue > 0}
          note={quote.note}
          sight={(amount) => {
            const live = quoteBorrow(wallet.account, market, amount);
            return <HawkSight health={live.projectedHealth} current={live.health} />;
          }}
        />
      </div>
    </Shell>
  );
}
