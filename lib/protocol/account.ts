import { getMarket } from "./markets";
import type { AccountSnapshot, BorrowQuote, Market } from "./types";

export const PREVIEW_ADDRESS = "0x2Bc6000000000000000000000000000000004e62" as const;

const PREVIEW_BALANCES: Record<string, number> = {
  PONS: 42000,
  HARMONIC: 180000,
  LONGBOW: 95000,
  ROUTE: 240000,
  CASHCAT: 18000,
};

export function previewAccount(): AccountSnapshot {
  return {
    address: PREVIEW_ADDRESS,
    preview: true,
    balances: PREVIEW_BALANCES,
    supplies: [
      { symbol: "CASHCAT", amount: 12000 },
      { symbol: "PONS", amount: 4000 },
    ],
    borrows: [{ symbol: "ROUTE", amount: 450000 }],
    collateral: [
      { symbol: "CASHCAT", amount: 12000, enabled: true },
      { symbol: "PONS", amount: 4000, enabled: true },
    ],
  };
}

export function emptyAccount(address: `0x${string}`): AccountSnapshot {
  return {
    address,
    preview: false,
    balances: {},
    supplies: [],
    borrows: [],
    collateral: [],
  };
}

export function balanceOf(account: AccountSnapshot | null, symbol: string) {
  if (!account) return null;
  return account.balances[symbol] ?? 0;
}

function positionValue(symbol: string, amount: number) {
  const market = getMarket(symbol);
  if (!market) return 0;
  return amount * market.price;
}

export function accountValues(account: AccountSnapshot) {
  const supplied = account.supplies.reduce((sum, position) => sum + positionValue(position.symbol, position.amount), 0);
  const borrowed = account.borrows.reduce((sum, position) => sum + positionValue(position.symbol, position.amount), 0);
  const core = coreBook(account);
  return {
    supplied,
    borrowed,
    net: supplied - borrowed,
    available: Math.max(0, core.limit - core.debt),
    health: core.debt > 0 ? core.liq / core.debt : null,
  };
}

function coreBook(account: AccountSnapshot) {
  let value = 0;
  let limit = 0;
  let liq = 0;
  const labels: string[] = [];

  for (const position of account.collateral) {
    if (!position.enabled) continue;
    const market = getMarket(position.symbol);
    if (!market || market.isolated) continue;
    const usd = position.amount * market.price;
    value += usd;
    limit += usd * market.ltv;
    liq += usd * market.liquidationThreshold;
    labels.push(market.symbol);
  }

  let debt = 0;
  for (const position of account.borrows) {
    const market = getMarket(position.symbol);
    if (!market || market.isolated) continue;
    debt += position.amount * market.price;
  }

  return { value, limit, liq, debt, label: labels.join(" · ") || "—" };
}

export function quoteBorrow(account: AccountSnapshot | null, market: Market, amount: number): BorrowQuote {
  if (!account) {
    return {
      collateralLabel: "—",
      collateralValue: 0,
      borrowLimit: 0,
      available: 0,
      liquidationThreshold: market.liquidationThreshold,
      health: null,
      projectedHealth: null,
      note: "Connect a wallet to size a borrow.",
      canBorrow: false,
    };
  }

  const core = coreBook(account);
  const health = core.debt > 0 ? core.liq / core.debt : null;

  if (market.isolated) {
    return {
      collateralLabel: market.symbol,
      collateralValue: 0,
      borrowLimit: 0,
      available: 0,
      liquidationThreshold: market.liquidationThreshold,
      health,
      projectedHealth: health,
      note: `${market.symbol} is isolated. Collateral posted here stays in this market, and none is posted in this preview.`,
      canBorrow: false,
    };
  }

  const additionalDebt = Math.max(0, amount) * market.price;
  const nextDebt = core.debt + additionalDebt;
  const projectedHealth = nextDebt > 0 && core.liq > 0 ? core.liq / nextDebt : health;
  const available = Math.max(0, core.limit - core.debt);
  const withinLimit = additionalDebt <= available + 1e-8 && core.value > 0;

  return {
    collateralLabel: core.label,
    collateralValue: core.value,
    borrowLimit: core.limit,
    available,
    liquidationThreshold: core.value > 0 ? core.liq / core.value : market.liquidationThreshold,
    health,
    projectedHealth: amount > 0 ? projectedHealth : health,
    note: core.value === 0 ? "Post collateral before borrowing." : null,
    canBorrow: amount > 0 && withinLimit,
  };
}
