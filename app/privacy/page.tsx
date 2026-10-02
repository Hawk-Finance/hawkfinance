import type { Metadata } from "next";
import { Shell } from "@/components/shell";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <Shell className="py-12 lg:py-16">
      <h1 className="text-[44px] tracking-[-0.035em]">Privacy</h1>
      <div className="mt-8 max-w-[680px] space-y-4 text-[16px] leading-[1.65] text-secondary">
        <p>Hawk does not require an account. A connected wallet address is read in your browser to display positions.</p>
        <p>The interface does not sell personal data. Transactions you submit are public on Robinhood Chain.</p>
        <p>A preview wallet never leaves this browser and does not represent an onchain identity.</p>
      </div>
    </Shell>
  );
}
