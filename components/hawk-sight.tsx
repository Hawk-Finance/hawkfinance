"use client";

import { useEffect, useRef, useState } from "react";
import { formatHealth } from "@/lib/protocol/format";

function tone(health: number | null) {
  if (health == null || !Number.isFinite(health)) {
    return { color: "#68756F", label: "rest" };
  }
  if (health >= 1.8) return { color: "#C8FF4D", label: "safe" };
  if (health >= 1.25) return { color: "#E5C76B", label: "medium" };
  return { color: "#E77C72", label: "risk" };
}

function position(health: number | null) {
  if (health == null || !Number.isFinite(health)) return 14;
  const clamped = Math.min(Math.max(health, 1), 3);
  const safety = (clamped - 1) / 2;
  return 88 - safety * 76;
}

function useTween(value: number | null) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      reduced ||
      start == null ||
      value == null ||
      !Number.isFinite(start) ||
      !Number.isFinite(value)
    ) {
      setDisplay(value);
      from.current = value;
      return;
    }

    const began = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / 520);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(start + (value - start) * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        from.current = value;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return display;
}

export function HawkSight({
  health,
  current,
  className,
}: {
  health: number | null;
  current?: number | null;
  className?: string;
}) {
  const shown = useTween(health);
  const { color } = tone(shown);
  const left = position(shown);
  const reading = formatHealth(shown);
  const moved = current != null && health != null && Math.abs(current - health) > 0.01;

  return (
    <div className={className} role="meter" aria-label="Hawk Sight" aria-valuemin={1} aria-valuemax={3} aria-valuenow={shown && Number.isFinite(shown) ? Number(shown.toFixed(2)) : undefined} aria-valuetext={reading === "—" ? "No open borrow" : `Health factor ${reading}`}>
      <p className="text-[11px] tracking-[0.22em] text-secondary">HAWK SIGHT</p>
      <div className="mt-4 flex items-center gap-4">
        <span className="text-[10px] tracking-[0.18em] text-muted">SAFE</span>
        <div className="relative h-px flex-1 bg-[rgba(241,240,234,0.18)]">
          <span
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full motion-reduce:transition-none transition-[left,background-color] duration-500 ease-out"
            style={{ left: `${left}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-[10px] tracking-[0.18em] text-muted">RISK</span>
      </div>
      <p className="mt-4 text-[15px] text-secondary">
        Health Factor <span className="tabular-nums text-ivory">{reading}</span>
        {moved && current != null && Number.isFinite(current) ? (
          <span className="ml-3 text-[13px] text-muted">from {formatHealth(current)}</span>
        ) : null}
      </p>
    </div>
  );
}
