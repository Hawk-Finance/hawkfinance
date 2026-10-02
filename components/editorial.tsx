import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Crosshair } from "lucide-react";

const CAPABILITIES = [
  { title: "Supply", copy: "Earn yield on your assets.", icon: ArrowDown },
  { title: "Borrow", copy: "Access liquidity without selling.", icon: ArrowUpRight },
  { title: "Discover", copy: "Find emerging credit markets.", icon: Crosshair },
  { title: "Move", copy: "Put capital to work.", icon: ArrowRight },
];

export function Editorial() {
  return (
    <section className="border-t border-[rgba(241,240,234,0.08)]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-muted">BUILT FOR WHAT&apos;S NEXT</p>
            <h2 className="mt-4 text-[clamp(40px,4.4vw,60px)] leading-[0.96] font-medium tracking-[-0.04em] text-ivory">
              Liquidity for
              <span className="block">
                emerging <span className="font-serif text-lime">markets.</span>
              </span>
            </h2>
          </div>
          <div className="rounded-2xl border border-[rgba(241,240,234,0.12)] bg-[#0c1c18] px-6 py-6 lg:px-7 lg:py-7">
            <p className="max-w-[46ch] text-[15px] leading-[1.6] text-secondary">
              Hawk brings liquidity to emerging onchain assets. A permissionless credit layer for markets that are still
              finding their depth, on Robinhood Chain.
            </p>
            <Link href="/docs#vision" className="group mt-5 inline-flex items-center gap-1.5 text-[14px] text-lime">
              Our vision
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 lg:mt-14 lg:grid-cols-4">
          {CAPABILITIES.map((item) => (
            <li key={item.title}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(241,240,234,0.12)] text-ivory">
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </span>
              <h3 className="mt-4 text-[15px] font-medium text-ivory">{item.title}</h3>
              <p className="mt-1 text-[13px] leading-snug text-secondary">{item.copy}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
