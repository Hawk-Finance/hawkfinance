import type { Market, ProtocolOverview } from "./types";

export const MARKETS: Market[] = [
  {
    symbol: "PONS",
    name: "Pons",
    decimals: 18,
    price: 0.53,
    labels: ["EMERGING"],
    isolated: false,
    suppliedUsd: 4_200_000,
    borrowedUsd: 2_600_000,
    supplyApy: 0.086,
    borrowApy: 0.164,
    ltv: 0.38,
    liquidationThreshold: 0.48,
    liquidationPenalty: 0.08,
    supplyCapUsd: 8_000_000,
    borrowCapUsd: 4_000_000,
    oracleStatus: "Guarded",
    liquidityDepth: "Moderate",
    summary: "Pons. Emerging depth, a guarded oracle, and a loan-to-value set for a thin book.",
  },
  {
    symbol: "HARMONIC",
    name: "Harmonic",
    decimals: 18,
    price: 0.0068,
    labels: ["EMERGING"],
    isolated: false,
    suppliedUsd: 1_600_000,
    borrowedUsd: 1_200_000,
    supplyApy: 0.104,
    borrowApy: 0.196,
    ltv: 0.32,
    liquidationThreshold: 0.42,
    liquidationPenalty: 0.09,
    supplyCapUsd: 3_000_000,
    borrowCapUsd: 1_800_000,
    oracleStatus: "Guarded",
    liquidityDepth: "Thin",
    summary: "Harmonic. Thin depth and a guarded oracle. Collateral here backs borrows across the Hawk book.",
  },
  {
    symbol: "LONGBOW",
    name: "Longbow",
    decimals: 18,
    price: 0.0063,
    labels: ["EMERGING"],
    isolated: false,
    suppliedUsd: 2_100_000,
    borrowedUsd: 1_500_000,
    supplyApy: 0.091,
    borrowApy: 0.172,
    ltv: 0.34,
    liquidationThreshold: 0.44,
    liquidationPenalty: 0.09,
    supplyCapUsd: 4_000_000,
    borrowCapUsd: 2_400_000,
    oracleStatus: "Guarded",
    liquidityDepth: "Thin",
    summary: "Longbow. A thin book with a lower loan-to-value than Pons or Cash Cat.",
  },
  {
    symbol: "ROUTE",
    name: "Route",
    decimals: 18,
    price: 0.002,
    labels: ["NEW"],
    isolated: false,
    suppliedUsd: 1_300_000,
    borrowedUsd: 1_000_000,
    supplyApy: 0.118,
    borrowApy: 0.224,
    ltv: 0.28,
    liquidationThreshold: 0.38,
    liquidationPenalty: 0.1,
    supplyCapUsd: 2_500_000,
    borrowCapUsd: 1_500_000,
    oracleStatus: "Guarded",
    liquidityDepth: "Thin",
    summary: "Route. The newest listing, the smallest book, and the tightest loan-to-value.",
  },
  {
    symbol: "CASHCAT",
    name: "Cash Cat",
    decimals: 18,
    price: 0.176,
    labels: ["EMERGING"],
    isolated: false,
    suppliedUsd: 3_600_000,
    borrowedUsd: 2_400_000,
    supplyApy: 0.074,
    borrowApy: 0.138,
    ltv: 0.42,
    liquidationThreshold: 0.52,
    liquidationPenalty: 0.08,
    supplyCapUsd: 6_000_000,
    borrowCapUsd: 3_500_000,
    oracleStatus: "Guarded",
    liquidityDepth: "Moderate",
    summary: "Cash Cat. The deepest of the five books, still priced with a guarded oracle.",
  },
];

export function listMarkets() {
  return MARKETS;
}

export function getMarket(symbol: string) {
  return MARKETS.find((market) => market.symbol.toLowerCase() === symbol.toLowerCase()) ?? null;
}

export function availableUsd(market: Market) {
  return market.suppliedUsd - market.borrowedUsd;
}

export function utilization(market: Market) {
  if (market.suppliedUsd <= 0) return 0;
  return market.borrowedUsd / market.suppliedUsd;
}

export function protocolOverview(): ProtocolOverview {
  const supplied = MARKETS.reduce((sum, market) => sum + market.suppliedUsd, 0);
  const borrowed = MARKETS.reduce((sum, market) => sum + market.borrowedUsd, 0);
  return {
    supplied,
    borrowed,
    available: supplied - borrowed,
    utilization: supplied > 0 ? borrowed / supplied : 0,
    deltas: { supplied: 0.124, borrowed: 0.081, available: 0.142 },
  };
}
