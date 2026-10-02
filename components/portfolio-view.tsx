"use client";

import { accountValues } from "@/lib/protocol/account";
import { formatApy, formatPercent, formatToken, formatUsd, shortAddress } from "@/lib/protocol/format";
import { getMarket } from "@/lib/protocol/markets";
import { useWallet } from "@/lib/wallet";
import { AssetIcon } from "./asset-icon";
import { HawkSight } from "./hawk-sight";
import { PageHeader } from "./page-header";
import { PositionTable } from "./position-table";
import { Shell } from "./shell";
import { WalletAssets } from "./wallet-assets";

function AssetName({ symbol }: { symbol: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <AssetIcon symbol={symbol} />
      <span>{symbol}</span>
    </span>
  );
}

export function PortfolioView() {
  const wallet = useWallet();
  const account = wallet.account;
  const values = account ? accountValues(account) : null;

  const metrics = [
    { label: "Net Value", value: values ? formatUsd(values.net, "exact") : "—" },
    { label: "Supplied", value: values ? formatUsd(values.supplied, "exact") : "—" },
    { label: "Borrowed", value: values ? formatUsd(values.borrowed, "exact") : "—" },
    { label: "Available to Borrow", value: values ? formatUsd(values.available, "exact") : "—" },
  ];

  return (
    <Shell className="py-12 lg:py-16">
      <PageHeader
        title="Portfolio"
        subtitle={account ? "A statement of what you have supplied, borrowed, and posted." : "Connect a wallet to read your statement."}
        detail={
          account ? (
            <span>
              {shortAddress(account.address)}
              {account.preview ? " · Preview statement" : wallet.hawk ? " · Hawk wallet" : ""}
            </span>
          ) : null
        }
      />

      {wallet.address && !wallet.preview ? <WalletAssets address={wallet.address} /> : null}

      <div className="mt-14 grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={[
              "px-1 py-6 lg:px-6 lg:py-8",
              index % 2 === 1 ? "border-l border-line" : "",
              index > 1 ? "border-t border-line lg:border-t-0" : "",
              index === 2 ? "lg:border-l" : "",
            ].join(" ")}
          >
            <p className="text-[10px] tracking-[0.16em] text-muted uppercase">{metric.label}</p>
            <p className="mt-3 text-[28px] tracking-[-0.03em] text-ivory tabular-nums sm:text-[34px]">{metric.value}</p>
          </div>
        ))}
      </div>

      <HawkSight health={values?.health ?? null} className="mt-12 max-w-3xl" />

      {!account ? (
        <button
          type="button"
          onClick={() => {
            void wallet.connect().then((result) => {
              if (result === "no-wallet") wallet.startPreview();
            });
          }}
          className="mt-8 bg-lime px-5 py-3 text-[14px] font-medium text-canvas"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <PositionTable
            title="Your Supply"
            columns={[
              { key: "asset", header: "Asset" },
              { key: "amount", header: "Supplied", align: "right" },
              { key: "value", header: "Value", align: "right" },
              { key: "apy", header: "Supply APY", align: "right" },
            ]}
            empty="No supply position yet."
            rows={account.supplies.map((position) => {
              const market = getMarket(position.symbol);
              const value = market ? position.amount * market.price : 0;
              return {
                id: position.symbol,
                cells: {
                  asset: <AssetName symbol={position.symbol} />,
                  amount: formatToken(position.amount),
                  value: formatUsd(value, "exact"),
                  apy: <span className="text-lime">{market ? formatApy(market.supplyApy) : "—"}</span>,
                },
              };
            })}
          />
          <PositionTable
            title="Your Borrowing"
            columns={[
              { key: "asset", header: "Asset" },
              { key: "amount", header: "Borrowed", align: "right" },
              { key: "value", header: "Value", align: "right" },
              { key: "apy", header: "Borrow APY", align: "right" },
            ]}
            empty="No open borrow."
            rows={account.borrows.map((position) => {
              const market = getMarket(position.symbol);
              const value = market ? position.amount * market.price : 0;
              return {
                id: position.symbol,
                cells: {
                  asset: <AssetName symbol={position.symbol} />,
                  amount: formatToken(position.amount),
                  value: formatUsd(value, "exact"),
                  apy: market ? formatApy(market.borrowApy) : "—",
                },
              };
            })}
          />
          <PositionTable
            title="Collateral Positions"
            columns={[
              { key: "asset", header: "Asset" },
              { key: "amount", header: "Amount", align: "right" },
              { key: "value", header: "Value", align: "right" },
              { key: "ltv", header: "LTV", align: "right" },
              { key: "status", header: "Status", align: "right" },
            ]}
            empty="No collateral posted."
            rows={account.collateral.map((position) => {
              const market = getMarket(position.symbol);
              const value = market ? position.amount * market.price : 0;
              return {
                id: position.symbol,
                cells: {
                  asset: <AssetName symbol={position.symbol} />,
                  amount: formatToken(position.amount),
                  value: formatUsd(value, "exact"),
                  ltv: market ? formatPercent(market.ltv, 0) : "—",
                  status: position.enabled ? "Enabled" : "Earning only",
                },
              };
            })}
          />
        </>
      )}
    </Shell>
  );
}
