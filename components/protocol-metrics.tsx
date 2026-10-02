"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatPercent, formatUsd } from "@/lib/protocol/format";
import { protocolOverview } from "@/lib/protocol/markets";
import { useWallet } from "@/lib/wallet";

const SPARK = [0.62, 0.7, 0.66, 0.78, 0.74, 0.86, 0.8, 0.92, 0.88, 1];

function Sparkline() {
  const width = 72;
  const height = 22;
  const points = SPARK.map((value, index) => {
    const x = (index / (SPARK.length - 1)) * width;
    const y = height - value * (height - 3) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="mt-2">
      <polyline fill="none" stroke="#C8FF4D" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export function ProtocolMetrics() {
  const wallet = useWallet();
  const supplied = wallet.markets.reduce((sum, market) => sum + market.suppliedUsd, 0);
  const borrowed = wallet.markets.reduce((sum, market) => sum + market.borrowedUsd, 0);
  const overview = {
    supplied,
    borrowed,
    available: supplied - borrowed,
    utilization: supplied > 0 ? borrowed / supplied : 0,
    deltas: protocolOverview().deltas,
  };
  const cells = [
    { label: "Total Supplied", value: formatUsd(overview.supplied), delta: overview.deltas.supplied },
    { label: "Total Borrowed", value: formatUsd(overview.borrowed), delta: overview.deltas.borrowed },
    { label: "Available", value: formatUsd(overview.available), delta: overview.deltas.available },
    { label: "Utilization", value: formatPercent(overview.utilization), delta: null },
  ];

  return (
    <div className="rounded-2xl border border-[rgba(241,240,234,0.12)] bg-[#0c1c18] p-2">
      <div className="grid grid-cols-2">
        {cells.map((cell, index) => (
          <div
            key={cell.label}
            className={[
              "px-4 py-4 sm:px-5 sm:py-5",
              index % 2 === 0 ? "border-r border-[rgba(241,240,234,0.08)]" : "",
              index < 2 ? "border-b border-[rgba(241,240,234,0.08)]" : "",
            ].join(" ")}
          >
            <p className="text-[10px] tracking-[0.14em] text-muted uppercase">{cell.label}</p>
            <p className="mt-2 text-[26px] leading-none tracking-[-0.03em] text-ivory tabular-nums sm:text-[30px]">
              {cell.value}
            </p>
            {cell.delta == null ? <Sparkline /> : <span className="mt-2 block h-[18px]" />}
          </div>
        ))}
      </div>
      <Link
        href="/docs#how-it-works"
        className="group mx-1 mt-1 mb-1 flex items-center gap-3 rounded-xl border border-[rgba(241,240,234,0.1)] px-3 py-3 transition-colors duration-200 hover:bg-[rgba(241,240,234,0.03)]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(200,255,77,0.1)] text-lime">
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] text-ivory">New to Hawk?</span>
          <span className="block text-[13px] text-secondary">Learn how it works in 2 minutes.</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.5} />
      </Link>
    </div>
  );
}
