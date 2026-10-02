import Image from "next/image";
import { cn } from "@/lib/cn";

const PORTRAITS: Record<string, string> = {
  PONS: "/tokens/pons.jpg",
  HARMONIC: "/tokens/harmonic.jpg",
  LONGBOW: "/tokens/longbow.jpg",
  ROUTE: "/tokens/route.jpg",
  CASHCAT: "/tokens/cashcat.jpg",
};

function Mark({ symbol }: { symbol: string }) {
  const portrait = PORTRAITS[symbol];
  if (portrait) {
    return <Image src={portrait} alt="" width={64} height={64} className="h-full w-full object-cover" />;
  }
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full">
      <circle cx="16" cy="16" r="16" fill="#16352C" />
      <circle cx="16" cy="16" r="6.5" fill="none" stroke="#F1F0EA" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="2" fill="#C8FF4D" />
    </svg>
  );
}

export function AssetIcon({
  symbol,
  className,
  size = "md",
}: {
  symbol: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-full",
        size === "sm" ? "h-[22px] w-[22px]" : "h-7 w-7",
        className,
      )}
    >
      <Mark symbol={symbol} />
    </span>
  );
}
