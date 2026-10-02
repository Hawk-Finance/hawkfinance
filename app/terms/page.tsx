import type { Metadata } from "next";
import { Shell } from "@/components/shell";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <Shell className="py-12 lg:py-16">
      <h1 className="text-[44px] tracking-[-0.035em]">Terms</h1>
      <div className="mt-8 max-w-[680px] space-y-4 text-[16px] leading-[1.65] text-secondary">
        <p>Hawk is a non-custodial interface for onchain credit markets on Robinhood Chain.</p>
        <p>
          Nothing on this site is an offer of securities, a solicitation, or investment advice. You are responsible for
          your wallet, your positions, and for understanding liquidation, oracle, and smart-contract risk.
        </p>
        <p>Figures in the interface are illustrative until Hawk markets are live. Using the interface is at your own risk.</p>
      </div>
    </Shell>
  );
}
