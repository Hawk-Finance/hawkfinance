import Link from "next/link";
import { Shell } from "@/components/shell";

export default function NotFound() {
  return (
    <Shell className="py-24">
      <p className="text-[11px] tracking-[0.22em] text-muted">404</p>
      <h1 className="mt-4 text-[44px] tracking-[-0.035em]">Page not found.</h1>
      <p className="mt-4 text-secondary">That route is not part of Hawk.</p>
      <Link href="/markets" className="mt-8 inline-flex text-[14px] text-ivory">
        Back to markets →
      </Link>
    </Shell>
  );
}
