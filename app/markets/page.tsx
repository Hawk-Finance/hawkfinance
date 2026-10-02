import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketTable } from "@/components/market-table";
import { PageHeader } from "@/components/page-header";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Markets",
  description: "Supply liquidity and borrow against emerging assets on Robinhood Chain.",
};

export default function MarketsPage() {
  return (
    <Shell className="py-12 lg:py-16">
      <PageHeader
        title="Markets"
        subtitle="Supply liquidity. Borrow against emerging assets."
        detail="Loan-to-value stays low. Oracles on these markets are guarded."
      />
      <MarketTable variant="overview" />
      <Link href="/supply" className="group mt-8 inline-flex items-center gap-2 text-[14px] text-ivory">
        Supply an asset
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.25} />
      </Link>
    </Shell>
  );
}
