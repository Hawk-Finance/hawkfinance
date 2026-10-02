import type { Metadata } from "next";
import { Suspense } from "react";
import { SupplyWorkspace } from "@/components/supply-workspace";

export const metadata: Metadata = {
  title: "Supply",
  description: "Put idle assets to work on Hawk.",
};

export default function SupplyPage() {
  return (
    <Suspense>
      <SupplyWorkspace />
    </Suspense>
  );
}
