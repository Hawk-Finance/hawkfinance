# Hawk

Credit markets for emerging assets on Robinhood Chain.

Live app: [hawkfinance.app](https://hawkfinance.app)

## App

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build
```

## Contracts

[Foundry](https://book.getfoundry.sh/) is required.

```bash
cd contracts
forge test
```

The pool is deployed on Robinhood Chain (chain id 4663):

`0x10a860E070c8be84A816A16323B567e2224Eec88`

Markets: PONS, HARMONIC, LONGBOW, ROUTE, CASHCAT.
