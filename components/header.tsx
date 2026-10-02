"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { NetworkSelector } from "./network-selector";
import { Shell } from "./shell";
import { WalletButton } from "./wallet-button";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "/markets", label: "Markets" },
  { href: "/supply", label: "Supply" },
  { href: "/borrow", label: "Borrow" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <Shell className="flex h-[72px] items-center justify-between gap-6">
        <Link href="/" aria-label="Hawk home">
          <Wordmark priority className="[&>span]:hidden sm:[&>span]:inline" />
        </Link>

        <nav className="hidden h-full items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active =
              item.href === "/markets"
                ? pathname === "/" || pathname.startsWith("/markets")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-full items-center text-[14px] transition-colors duration-200",
                  active ? "text-ivory" : "text-secondary hover:text-ivory",
                )}
              >
                {item.label}
                {active ? <span className="absolute right-0 -bottom-px left-0 h-0.5 bg-lime" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <NetworkSelector />
          <WalletButton />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-line text-ivory lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" strokeWidth={1.25} /> : <Menu className="h-4 w-4" strokeWidth={1.25} />}
          </button>
        </div>
      </Shell>
      {open ? (
        <nav className="border-t border-line bg-canvas lg:hidden" aria-label="Mobile">
          <Shell className="flex flex-col py-3">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn("border-b border-line-subtle py-3 text-[16px]", active ? "text-lime" : "text-ivory")}
                >
                  {item.label}
                </Link>
              );
            })}
          </Shell>
        </nav>
      ) : null}
    </header>
  );
}
