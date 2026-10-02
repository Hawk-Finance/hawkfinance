import Image from "next/image";
import { cn } from "@/lib/cn";

export function HawkMark({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/hawk-mark.png"
      alt=""
      width={669}
      height={381}
      priority={priority}
      className={cn("h-7 w-auto", className)}
    />
  );
}
