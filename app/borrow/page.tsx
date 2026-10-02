import type { Metadata } from "next";
import { Suspense } from "react";
import { BorrowWorkspace } from "@/components/borrow-workspace";

export const metadata: Metadata = {
  title: "Borrow",
  description: "Unlock liquidity without leaving your position.",
};

export default function BorrowPage() {
  return (
    <Suspense>
      <BorrowWorkspace />
    </Suspense>
  );
}
