import { Editorial } from "@/components/editorial";
import { Hero } from "@/components/hero";
import { MarketTable } from "@/components/market-table";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="border-t border-[rgba(241,240,234,0.08)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-5 flex items-baseline justify-between gap-6">
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h2 className="text-[28px] leading-none tracking-[-0.03em] text-ivory sm:text-[32px]">Markets</h2>
              <p className="text-[14px] text-secondary">Supply liquidity. Borrow against what moves.</p>
            </div>
            <Link href="/markets" className="group hidden shrink-0 items-center gap-1 text-[13px] text-secondary transition-colors duration-200 hover:text-ivory sm:inline-flex">
              View all markets
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.75} />
            </Link>
          </div>
          <MarketTable variant="overview" />
          <Link href="/markets" className="mt-5 inline-flex items-center gap-1 text-[13px] text-secondary sm:hidden">
            View all markets
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
      <Editorial />
    </>
  );
}
