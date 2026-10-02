/**
 * Protocol data access.
 * Screens read from these functions only.
 * Replace the bodies with viem contract reads when Hawk pools are deployed.
 */
export { availableUsd, getMarket, listMarkets, protocolOverview, utilization } from "./markets";
export { accountValues, balanceOf, emptyAccount, previewAccount, quoteBorrow } from "./account";
export type { AccountSnapshot, BorrowQuote, Market, MarketLabel, ProtocolOverview } from "./types";
