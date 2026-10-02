import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WalletProvider } from "@/lib/wallet";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: {
    default: "HAWK — Capital with direction.",
    template: "%s — HAWK",
  },
  description:
    "Credit markets for emerging onchain assets. Supply liquidity. Borrow against emerging assets on Robinhood Chain.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas font-sans text-ivory">
        <WalletProvider>
          <div className="flex min-h-full flex-col">
            <a
              href="#content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-lime focus:px-3 focus:py-2 focus:text-canvas"
            >
              Skip to content
            </a>
            <Header />
            <main id="content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
