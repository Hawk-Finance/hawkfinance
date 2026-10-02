export type MarketLabel = "NEW" | "EMERGING" | "ISOLATED";

export type OracleStatus = "Live" | "Guarded";

export type LiquidityDepth = "Deep" | "Moderate" | "Thin";

/**
 * A lendable reserve on the Hawk book. The five markets share one margin account.
 * USD fields are illustrative until an onchain source replaces this module.
 */
export type Market = {
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  labels: MarketLabel[];
  isolated: boolean;
  suppliedUsd: number;
  borrowedUsd: number;
  supplyApy: number;
  borrowApy: number;
  ltv: number;
  liquidationThreshold: number;
  liquidationPenalty: number;
  supplyCapUsd: number;
  borrowCapUsd: number;
  oracleStatus: OracleStatus;
  liquidityDepth: LiquidityDepth;
  summary: string;
};

export type TokenPosition = {
  symbol: string;
  amount: number;
};

export type CollateralPosition = TokenPosition & {
  enabled: boolean;
};

export type AccountSnapshot = {
  address: `0x${string}`;
  preview: boolean;
  balances: Record<string, number>;
  supplies: TokenPosition[];
  borrows: TokenPosition[];
  collateral: CollateralPosition[];
};

export type ProtocolOverview = {
  supplied: number;
  borrowed: number;
  available: number;
  utilization: number;
  deltas: {
    supplied: number;
    borrowed: number;
    available: number;
  };
};

export type BorrowQuote = {
  collateralLabel: string;
  collateralValue: number;
  borrowLimit: number;
  available: number;
  liquidationThreshold: number;
  health: number | null;
  projectedHealth: number | null;
  note: string | null;
  canBorrow: boolean;
};
