# Hawk

Credit markets for emerging assets on Robinhood Chain.

Live app: [hawkfinance.app](https://hawkfinance.app)

The software is released under the [MIT license](LICENSE).

## The book

Five markets share one margin account. A supply posts collateral. A borrow draws liquidity that is already in the pool. Withdraw and borrow both revert when the position would pass its limit.

| Market | Price | LTV | Liquidation | Supply APR | Borrow APR |
| --- | --- | --- | --- | --- | --- |
| PONS | $0.53 | 38% | 48% | 8.60% | 16.40% |
| HARMONIC | $0.0068 | 32% | 42% | 10.40% | 19.60% |
| LONGBOW | $0.0063 | 34% | 44% | 9.10% | 17.20% |
| ROUTE | $0.002 | 28% | 38% | 11.80% | 22.40% |
| CASHCAT | $0.176 | 42% | 52% | 7.40% | 13.80% |

Prices and APR figures are set in the pool constructor. They are the numbers the interface reads.

The pool does not accrue interest, charge a protocol fee, or liquidate. The APR and penalty values are stored so the interface can show them. Tokens move one for one on supply, withdraw, borrow, and repay.

## Deployment

Robinhood Chain, chain id 4663.

Pool: `0x10a860E070c8be84A816A16323B567e2224Eec88`

| Market | Token |
| --- | --- |
| PONS | `0x39dBED3a2bd333467115dE45665cC57F813C4571` |
| HARMONIC | `0xdEe52F2ab639b6942B0d0F0565400b93b7a0fbe5` |
| LONGBOW | `0x451b42A15100C340CA12F7c66DE06fac5EA2D751` |
| ROUTE | `0x4A72B9702f991b790788f8AFA9e7112541f4E8f8` |
| CASHCAT | `0x020bfC650A365f8BB26819deAAbF3E21291018b4` |

LONGBOW reads the BOW token. The interface keeps the LONGBOW name.

## App

```bash
npm install
npm run dev
npm run build
```

Copy `.env.example` when a local RPC override is needed. Signing keys stay out of the repository.

## Contracts

[Foundry](https://book.getfoundry.sh/) is required. `forge-std` is a submodule.

```bash
git submodule update --init --recursive
cd contracts
forge test
```

`src/HawkPool.sol` is the deployed book. `src/mocks/HawkToken.sol` is a mintable stand-in for tests. `script/DeployLocal.s.sol` uses those stand-ins on a local chain. `script/DeployRobinhood.s.sol` is the broadcast that created the live pool. It does not mint tokens.
