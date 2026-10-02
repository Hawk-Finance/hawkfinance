"use client";

import { useEffect, useState } from "react";
import type { Holding } from "@/lib/portfolio/holdings";
import { AssetIcon } from "./asset-icon";

function formatAmount(amount: string) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;
  if (value === 0) return "0";
  const digits = value >= 1000 ? 2 : value >= 1 ? 4 : value >= 0.0001 ? 6 : 8;
  const text = value.toLocaleString("en-US", { maximumFractionDigits: digits });
  return text === "0" ? amount : text;
}

function formatPrice(price: number) {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const digits = price >= 0.01 ? 4 : 6;
  return `$${price.toLocaleString("en-US", { maximumFractionDigits: digits })}`;
}

function formatValue(amount: string, price: number) {
  const value = Number(amount) * price;
  if (!Number.isFinite(value)) return "Price loading";
  if (value === 0) return "$0";
  if (value >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (value >= 1) return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const text = value.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return text === "0" ? `$${value.toPrecision(2)}` : `$${text}`;
}

function HoldingMark({ asset }: { asset: Holding }) {
  if (asset.image) {
    return (
      <span aria-hidden className="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full">
        <img src={asset.image} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  return <AssetIcon symbol={asset.symbol} />;
}

export function WalletAssets({ address }: { address: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [assets, setAssets] = useState<Holding[]>([]);

  useEffect(() => {
    let alive = true;
    const id = window.setTimeout(() => {
      setStatus("loading");
      setAssets([]);
      void fetch(`/api/holdings?address=${address}`)
        .then(async (response) => {
          const body = (await response.json()) as { assets?: Holding[] };
          if (!response.ok || !body.assets) throw new Error("unread");
          return body.assets;
        })
        .then((next) => {
          if (!alive) return;
          setAssets(next);
          setStatus("ready");
        })
        .catch(() => {
          if (!alive) return;
          setAssets([]);
          setStatus("error");
        });
    }, 0);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [address]);

  const priced = assets.every((asset) => asset.price != null);
  const total = assets.reduce((sum, asset) => sum + Number(asset.amount) * (asset.price ?? 0), 0);

  return (
    <section>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-[22px] tracking-[-0.02em] text-ivory">Wallet</h2>
          <p className="mt-2 text-[14px] text-secondary">Balances held on Robinhood Chain.</p>
        </div>
        {status === "ready" && priced ? (
          <p className="text-[22px] tracking-[-0.03em] text-ivory tabular-nums">{formatValue(String(total), 1)}</p>
        ) : null}
      </div>
      {status === "loading" ? <p className="mt-6 text-[14px] text-muted">Reading balances.</p> : null}
      {status === "error" ? <p className="mt-6 text-[14px] text-muted">Balances could not be read.</p> : null}
      {status === "ready" ? (
        <div className="mt-5 overflow-x-auto border-t border-line">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line">
                {["Asset", "Balance", "Price", "Value"].map((header, index) => (
                  <th
                    key={header}
                    className={`py-3 text-[10px] font-medium tracking-[0.16em] text-muted uppercase ${index === 0 ? "" : "text-right"}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.address ?? asset.symbol} className="border-b border-line-subtle">
                  <td className="h-14 text-[14px] text-ivory">
                    <span className="inline-flex items-center gap-3">
                      <HoldingMark asset={asset} />
                      <span>
                        <span className="block">{asset.symbol}</span>
                        <span className="block text-[12px] text-muted">{asset.name}</span>
                      </span>
                    </span>
                  </td>
                  <td className="h-14 text-right text-[14px] text-ivory tabular-nums">{formatAmount(asset.amount)}</td>
                  <td className="h-14 text-right text-[14px] text-secondary tabular-nums">
                    {asset.price == null ? <span className="text-muted">Price loading</span> : formatPrice(asset.price)}
                  </td>
                  <td className="h-14 text-right text-[14px] text-ivory tabular-nums">
                    {asset.price == null ? <span className="text-muted">Price loading</span> : formatValue(asset.amount, asset.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
