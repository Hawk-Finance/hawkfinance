import Link from "next/link";
import { links } from "@/lib/links";
import { Shell } from "./shell";
import { Wordmark } from "./wordmark";

const FOOTER = [
  { href: links.docs, label: "Docs", external: false },
  { href: links.x, label: "X", external: true },
  { href: links.terms, label: "Terms", external: false },
  { href: links.privacy, label: "Privacy", external: false },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <Shell className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <Wordmark />
          <p className="mt-4 text-[13px] text-muted">© 2026 Hawk Finance. All rights reserved.</p>
          <p className="mt-1 text-[12px] text-muted">Markets settle on Robinhood Chain.</p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 lg:pb-0.5" aria-label="Footer">
          {FOOTER.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-secondary transition-colors duration-200 hover:text-ivory"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="text-[14px] text-secondary transition-colors duration-200 hover:text-ivory"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </Shell>
    </footer>
  );
}
