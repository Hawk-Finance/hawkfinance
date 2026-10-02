import { cn } from "@/lib/cn";
import { HawkMark } from "./hawk-mark";

export function Wordmark({
  className,
  markClassName,
  priority = false,
}: {
  className?: string;
  markClassName?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <HawkMark priority={priority} className={cn("h-[22px] w-auto", markClassName)} />
      <span className="text-[13px] font-semibold tracking-[0.28em] text-ivory">HAWK</span>
    </span>
  );
}
