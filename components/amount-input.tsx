export function AmountInput({
  symbol,
  value,
  onChange,
  id,
}: {
  symbol: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
}) {
  return (
    <label htmlFor={id} className="block border-b border-line pb-3">
      <span className="text-[11px] tracking-[0.16em] text-muted uppercase">Amount</span>
      <span className="mt-2 flex items-baseline gap-3">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))}
          className="w-full bg-transparent text-[40px] leading-none tracking-[-0.04em] text-ivory tabular-nums outline-none placeholder:text-[rgba(241,240,234,0.22)]"
        />
        <span className="shrink-0 text-[14px] text-secondary">{symbol}</span>
      </span>
    </label>
  );
}
