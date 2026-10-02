import { cn } from "@/lib/cn";

const OPTIONS = [
  { id: "25", label: "25%" },
  { id: "50", label: "50%" },
  { id: "max", label: "MAX" },
] as const;

export function PercentageSelector({
  active,
  disabled,
  onSelect,
}: {
  active: string | null;
  disabled?: boolean;
  onSelect: (id: "25" | "50" | "max") => void;
}) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option.id)}
          className={cn(
            "border px-3 py-1.5 text-[12px] tracking-[0.08em] transition-colors duration-200 disabled:opacity-40",
            active === option.id
              ? "border-lime text-lime"
              : "border-line text-secondary hover:border-[rgba(241,240,234,0.28)] hover:text-ivory",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
