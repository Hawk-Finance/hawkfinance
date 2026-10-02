import type { Metadata } from "next";
import { PortfolioView } from "@/components/portfolio-view";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Supply, borrowing, and collateral on Hawk.",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}
