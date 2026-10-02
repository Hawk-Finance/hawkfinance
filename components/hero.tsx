import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AssetIcon } from "./asset-icon";
import { HawkSculpture } from "./hawk-sculpture";
import { ProtocolMetrics } from "./protocol-metrics";

const TRUST = ["PONS", "HARMONIC", "LONGBOW", "ROUTE", "CASHCAT"];

export function Hero() {
  return (
    <section>
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-y-10 px-5 py-8 sm:px-8 md:grid-cols-2 md:gap-x-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,1.05fr)_minmax(300px,0.78fr)] lg:px-10 lg:py-6">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="text-[11px] tracking-[0.18em] text-muted">ONCHAIN CREDIT / ROBINHOOD CHAIN</p>
          <h1 className="mt-4 text-[clamp(46px,4.4vw,68px)] leading-[0.92] font-medium tracking-[-0.045em]">
            <span className="block text-ivory">Capital</span>
            <span className="block text-lime">with direction.</span>
          </h1>
        </div>

        <div className="md:col-start-2 md:row-span-2 md:row-start-1 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <HawkSculpture />
        </div>

        <div className="lg:col-start-1 lg:row-start-2 lg:max-w-[380px] lg:self-start lg:pt-6">
          <p className="text-[15px] leading-[1.55] text-secondary">
            Supply liquidity. Borrow against emerging assets.
            <span className="block">Move capital without leaving your position.</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2.5 text-[14px] font-medium text-canvas transition-colors duration-200 hover:bg-[#d4ff71]"
            >
              Explore Markets
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <Link
              href="/supply"
              className="inline-flex items-center rounded-full border border-[rgba(241,240,234,0.22)] px-4 py-2.5 text-[14px] font-medium text-ivory transition-colors duration-200 hover:border-[rgba(241,240,234,0.45)]"
            >
              Launch App
            </Link>
          </div>
          <div className="mt-7">
            <div className="flex items-center gap-1.5">
              {TRUST.map((symbol) => (
                <AssetIcon key={symbol} symbol={symbol} size="sm" />
              ))}
            </div>
            <p className="mt-2.5 text-[13px] text-secondary">Five low-cap markets on Robinhood Chain.</p>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2">
          <ProtocolMetrics />
        </div>
      </div>
    </section>
  );
}
