export function formatUsd(value: number, mode: "compact" | "exact" = "compact") {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (mode === "compact" && abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (mode === "compact" && abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatToken(amount: number) {
  if (!Number.isFinite(amount)) return "—";
  if (amount === 0) return "0";
  if (amount >= 1000) {
    return amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  if (amount >= 1) {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return amount.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function formatApy(apy: number) {
  return `${(apy * 100).toFixed(2)}%`;
}

export function formatPercent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatHealth(health: number | null) {
  if (health == null) return "—";
  if (!Number.isFinite(health)) return "—";
  return health.toFixed(2);
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned || !/^\d*\.?\d*$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function amountToInput(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return String(Number(value.toFixed(6)));
}

export function shortAddress(address: string) {
  const hex = address.slice(2);
  return `0x${hex.slice(0, 4).toUpperCase()}...${hex.slice(-4).toLowerCase()}`;
}
