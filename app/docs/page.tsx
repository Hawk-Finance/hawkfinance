import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Docs",
  description: "How Hawk credit markets work on Robinhood Chain.",
};

const CHAPTERS = [
  {
    index: "01",
    title: "Supply",
    body: "Deposit a listed asset and earn the supply rate. The rate is borrower interest. It rises as more of the book is in use, and falls when liquidity sits idle. A withdrawal settles when the market still has unborrowed liquidity.",
  },
  {
    index: "02",
    title: "Borrow",
    body: "Post collateral and draw another listed asset without selling what you hold. PONS, HARMONIC, LONGBOW, ROUTE, and CASHCAT share one margin account. The limit is collateral value multiplied by each asset’s loan-to-value.",
  },
  {
    index: "03",
    title: "Hawk Sight",
    body: "Sight is a health reading, not a gauge. The point sits toward safe while collateral covers debt with room, and moves toward risk as the health factor approaches 1.00. At 1.00 the position can be liquidated.",
  },
  {
    index: "04",
    title: "The book",
    body: "Hawk lists these five assets and nothing else. Loan-to-value stays low because the books are thin. Every oracle is guarded. A move in one price changes health for the whole account, which is why Sight sits on the borrow.",
  },
];

const BOOKS = [
  { name: "PONS", ltv: "38%", oracle: "Guarded", depth: "Moderate" },
  { name: "HARMONIC", ltv: "32%", oracle: "Guarded", depth: "Thin" },
  { name: "LONGBOW", ltv: "34%", oracle: "Guarded", depth: "Thin" },
  { name: "ROUTE", ltv: "28%", oracle: "Guarded", depth: "Thin" },
  { name: "CASHCAT", ltv: "42%", oracle: "Guarded", depth: "Moderate" },
];

export default function DocsPage() {
  return (
    <Shell className="py-12 lg:py-16">
      <div className="grid items-end gap-8 border-b border-[rgba(241,240,234,0.08)] pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:gap-16">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-muted">DOCS</p>
          <h1 className="mt-4 text-[clamp(44px,5vw,68px)] leading-[0.94] font-medium tracking-[-0.04em] text-ivory">
            How Hawk
            <span className="block">
              <span className="font-serif text-lime">works.</span>
            </span>
          </h1>
        </div>
        <p className="max-w-[42ch] text-[16px] leading-[1.6] text-secondary lg:pb-2">
          A credit market for five low-cap assets on Robinhood Chain. One margin account. Loan-to-value set for thin books.
        </p>
      </div>

      <div id="how-it-works" className="mt-10 grid gap-4 md:grid-cols-2">
        {CHAPTERS.map((chapter) => (
          <article
            key={chapter.title}
            className="rounded-2xl border border-[rgba(241,240,234,0.12)] bg-[#0c1c18] px-6 py-6 lg:px-7 lg:py-7"
          >
            <p className="text-[11px] tracking-[0.18em] text-muted">{chapter.index}</p>
            <h2 className="mt-3 text-[22px] tracking-[-0.03em] text-ivory">{chapter.title}</h2>
            <p className="mt-3 max-w-[48ch] text-[15px] leading-[1.65] text-secondary">{chapter.body}</p>
          </article>
        ))}
      </div>

      <section className="mt-4 overflow-x-auto rounded-2xl border border-[rgba(241,240,234,0.12)]">
        <div className="min-w-[520px]">
        <div className="grid grid-cols-4 border-b border-[rgba(241,240,234,0.08)] px-6 py-3 text-[10px] tracking-[0.16em] text-muted uppercase">
          <span>Asset</span>
          <span>LTV</span>
          <span>Oracle</span>
          <span>Depth</span>
        </div>
        {BOOKS.map((book) => (
          <div
            key={book.name}
            className="grid grid-cols-4 items-center border-b border-line-subtle px-6 py-4 text-[14px] last:border-b-0"
          >
            <span className="font-medium text-ivory">{book.name}</span>
            <span className="text-secondary">{book.ltv}</span>
            <span className="text-secondary">{book.oracle}</span>
            <span className="text-secondary">{book.depth}</span>
          </div>
        ))}
        </div>
      </section>

      <section id="vision" className="mt-4 grid items-end gap-8 rounded-2xl border border-[rgba(241,240,234,0.12)] bg-[#0c1c18] px-6 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8 lg:py-10">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-muted">05</p>
          <h2 className="mt-3 text-[clamp(32px,3.4vw,44px)] leading-[0.98] font-medium tracking-[-0.035em] text-ivory">
            Liquidity for what is
            <span className="block font-serif text-lime">still finding a book.</span>
          </h2>
        </div>
        <div>
          <p className="max-w-[46ch] text-[15px] leading-[1.65] text-secondary">
            Large money markets list what is already liquid. Hawk is the credit layer for what is next on Robinhood Chain: newer assets, thinner books, and risk that stays named. Supply liquidity. Borrow against a position. Leave the asset where it is.
          </p>
          <Link href="/markets" className="group mt-6 inline-flex items-center gap-1.5 text-[14px] text-lime">
            View markets
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </Shell>
  );
}
