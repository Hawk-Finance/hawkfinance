import { cn } from "@/lib/cn";
import { formatApy } from "@/lib/protocol/format";

export function APYValue({
  apy,
  tone = "ivory",
  className,
}: {
  apy: number;
  tone?: "lime" | "ivory" | "yield" | "muted";
  className?: string;
}) {
  const color =
    tone === "lime" ? "text-lime" : tone === "yield" ? "text-[#c6e88a]" : tone === "muted" ? "text-secondary" : "text-ivory";
  return <span className={cn("tabular-nums", color, className)}>{formatApy(apy)}</span>;
}
