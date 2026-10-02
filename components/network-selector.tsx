"use client";

import { ChevronDown } from "lucide-react";
import { useWallet } from "@/lib/wallet";

export function NetworkSelector() {
  const wallet = useWallet();
  const wrong = wallet.status === "wrong-network";

  return (
    <button
      type="button"
      onClick={() => {
        if (wrong) void wallet.switchChain();
      }}
      className="hidden items-center gap-2 rounded-full border border-[rgba(241,240,234,0.12)] bg-[#0c1c18] py-1.5 pr-2.5 pl-3 text-[13px] text-ivory sm:inline-flex"
    >
      <span className={wrong ? "h-1.5 w-1.5 rounded-full bg-warning" : "h-1.5 w-1.5 rounded-full bg-lime"} />
      {wrong ? "Wrong network" : "Robinhood Chain"}
      <ChevronDown className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
    </button>
  );
}
