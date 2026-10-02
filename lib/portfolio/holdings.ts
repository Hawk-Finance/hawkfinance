import {
  createPublicClient,
  formatUnits,
  getAddress,
  http,
  isAddress,
  type Address,
} from "viem";
import { robinhoodChain } from "@/lib/chains";

const RPC = "https://rpc.mainnet.chain.robinhood.com";
const MULTICALL = "0xcA11bde05977b3631167028862bE2a173976CA11";
const USDG = "0x5fc5360d0400a0fd4f2af552add042d716f1d168";
const WETH = "0x0bd7d308f8e1639fab988df18a8011f41eacad73";
const ZERO = "0x0000000000000000000000000000000000000000";
const BOOK_TTL = 120_000;

const erc20 = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

export type Holding = {
  symbol: string;
  name: string;
  amount: string;
  price: number | null;
  image: string | null;
  address: string | null;
};

type TokenMeta = {
  address: Address;
  symbol: string;
  name: string;
  decimals: number | null;
  image?: string;
  price: number | null;
};

type Book = {
  tokens: TokenMeta[];
  ethPrice: number | null;
};

const headers = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

function client() {
  return createPublicClient({
    chain: robinhoodChain,
    transport: http(RPC, {
      timeout: 20_000,
      fetchOptions: { headers: { "User-Agent": "Mozilla/5.0" } },
    }),
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpUrl(value: unknown) {
  return typeof value === "string" && /^https?:\/\//.test(value) ? value : undefined;
}

function addressOf(value: string | undefined) {
  if (!value || !isAddress(value)) return null;
  return value.toLowerCase();
}

async function fetchJson(url: string) {
  let last: unknown;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers, cache: "no-store" });
    if (response.status === 429) {
      last = response.status;
      await sleep(800 * (attempt + 1));
      continue;
    }
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
  }
  throw new Error(`Request limited (${String(last)})`);
}

function remember(
  tokens: Map<string, TokenMeta>,
  input: { address: string; symbol?: string; name?: string; decimals?: number | null; image?: string },
) {
  const key = input.address.toLowerCase();
  if (key === ZERO || !isAddress(key)) return;
  if (input.symbol?.toUpperCase() === "USDG" && key !== USDG) return;
  const current = tokens.get(key);
  const symbol = (input.symbol || current?.symbol || "").trim();
  const name = (input.name || current?.name || symbol).trim();
  if (!symbol && !current) return;
  tokens.set(key, {
    address: getAddress(key),
    symbol: symbol || current?.symbol || "",
    name: name || current?.name || symbol,
    decimals: key === USDG ? 6 : (input.decimals ?? current?.decimals ?? null),
    image: input.image ?? current?.image,
    price: key === USDG ? 1 : (current?.price ?? null),
  });
}

async function geckoPages(tokens: Map<string, TokenMeta>) {
  const pooled = new Set<string>();
  let ethPrice = 0;
  let ethReserve = -1;
  for (let page = 1; page <= 6; page += 1) {
    if (page > 1) await sleep(400);
    let body: {
      data?: {
        attributes?: {
          base_token_price_usd?: string;
          quote_token_price_usd?: string;
          reserve_in_usd?: string;
        };
        relationships?: {
          base_token?: { data?: { id?: string } };
          quote_token?: { data?: { id?: string } };
        };
      }[];
      included?: {
        id?: string;
        attributes?: {
          address?: string;
          name?: string;
          symbol?: string;
          decimals?: number;
          image_url?: string;
        };
      }[];
    };
    try {
      body = await fetchJson(
        `https://api.geckoterminal.com/api/v2/networks/robinhood/pools?page=${page}&include=base_token,quote_token`,
      );
    } catch {
      continue;
    }
    const included = new Map((body.included ?? []).map((token) => [token.id, token]));
    for (const pool of body.data ?? []) {
      const baseId = pool.relationships?.base_token?.data?.id;
      const quoteId = pool.relationships?.quote_token?.data?.id;
      const base = included.get(baseId);
      const quote = included.get(quoteId);
      const baseAddress = addressOf(base?.attributes?.address);
      const quoteAddress = addressOf(quote?.attributes?.address);
      const reserve = Number(pool.attributes?.reserve_in_usd);
      const side = (address: string | null, raw: string | undefined) => {
        if (!address || (address !== WETH && address !== ZERO)) return;
        const price = Number(raw);
        if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(reserve)) return;
        if (reserve > ethReserve) {
          ethPrice = price;
          ethReserve = reserve;
        }
      };
      side(baseAddress, pool.attributes?.base_token_price_usd);
      side(quoteAddress, pool.attributes?.quote_token_price_usd);
      for (const token of [base, quote]) {
        const address = addressOf(token?.attributes?.address);
        if (!address) continue;
        remember(tokens, {
          address,
          symbol: token?.attributes?.symbol,
          name: token?.attributes?.name,
          decimals: token?.attributes?.decimals ?? null,
          image: httpUrl(token?.attributes?.image_url),
        });
        pooled.add(address);
      }
    }
  }
  return { ethPrice: ethReserve < 0 ? null : ethPrice, pooled };
}

async function dexscreenerAddresses() {
  const urls = [
    "https://api.dexscreener.com/token-profiles/latest/v1",
    "https://api.dexscreener.com/token-profiles/recent-updates/v1",
    "https://api.dexscreener.com/token-boosts/latest/v1",
    "https://api.dexscreener.com/token-boosts/top/v1",
    "https://api.dexscreener.com/community-takeovers/latest/v1",
    "https://api.dexscreener.com/ads/latest/v1",
  ];
  const lists = await Promise.all(
    urls.map(async (url) => {
      try {
        const body = (await fetchJson(url)) as { chainId?: string; tokenAddress?: string; icon?: string }[];
        return Array.isArray(body) ? body : [];
      } catch {
        return [];
      }
    }),
  );
  const found = new Map<string, string | undefined>();
  for (const row of lists.flat()) {
    if (row.chainId?.toLowerCase() !== "robinhood") continue;
    const address = addressOf(row.tokenAddress);
    if (!address || address === ZERO) continue;
    if (!found.has(address)) found.set(address, httpUrl(row.icon));
  }
  return found;
}

type DexPair = {
  chainId?: string;
  priceUsd?: string | null;
  liquidity?: { usd?: number | null } | null;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { address?: string; name?: string; symbol?: string };
  info?: { imageUrl?: string | null } | null;
};

async function dexscreenerPools(addresses: string[]) {
  const priced = new Map<string, { price: number; liquidity: number }>();
  const meta = new Map<string, { symbol?: string; name?: string; image?: string }>();
  const pooled = new Set<string>();
  for (let index = 0; index < addresses.length; index += 30) {
    const chunk = addresses.slice(index, index + 30);
    let pairs: DexPair[] = [];
    try {
      const body = await fetchJson(`https://api.dexscreener.com/tokens/v1/robinhood/${chunk.join(",")}`);
      pairs = Array.isArray(body) ? body : [];
    } catch {
      continue;
    }
    for (const pair of pairs) {
      if (pair.chainId?.toLowerCase() !== "robinhood") continue;
      const base = addressOf(pair.baseToken?.address);
      const quote = addressOf(pair.quoteToken?.address);
      if (quote) pooled.add(quote);
      if (!base) continue;
      pooled.add(base);
      const image = httpUrl(pair.info?.imageUrl);
      const current = meta.get(base);
      meta.set(base, {
        symbol: pair.baseToken?.symbol || current?.symbol,
        name: pair.baseToken?.name || current?.name,
        image: image ?? current?.image,
      });
      if (quote && pair.quoteToken?.symbol) {
        const quoted = meta.get(quote);
        meta.set(quote, {
          symbol: pair.quoteToken.symbol || quoted?.symbol,
          name: pair.quoteToken.name || quoted?.name,
          image: quoted?.image,
        });
      }
      const price = Number(pair.priceUsd);
      const liquidity = Number(pair.liquidity?.usd ?? 0);
      if (!Number.isFinite(price) || price <= 0) continue;
      const best = priced.get(base);
      if (!best || liquidity > best.liquidity) priced.set(base, { price, liquidity });
    }
  }
  return { priced, meta, pooled };
}

async function buildBook(): Promise<Book> {
  const tokens = new Map<string, TokenMeta>();
  const [gecko, listed] = await Promise.all([geckoPages(tokens), dexscreenerAddresses()]);
  const ethPrice = gecko.ethPrice;
  for (const [address, image] of listed) {
    if (tokens.has(address)) {
      const token = tokens.get(address);
      if (token && !token.image && image) token.image = image;
      continue;
    }
    tokens.set(address, {
      address: getAddress(address),
      symbol: "",
      name: "",
      decimals: address === USDG ? 6 : null,
      image,
      price: address === USDG ? 1 : null,
    });
  }
  remember(tokens, { address: USDG, symbol: "USDG", name: "Global Dollar", decimals: 6 });

  const { priced, meta, pooled } = await dexscreenerPools([...tokens.keys()]);
  for (const [key, token] of tokens) {
    const extra = meta.get(key);
    if (extra?.symbol && !token.symbol) token.symbol = extra.symbol;
    if (extra?.name && (!token.name || token.name === token.symbol)) token.name = extra.name;
    if (extra?.image && !token.image) token.image = extra.image;
    if (key === USDG) {
      token.price = 1;
      token.decimals = 6;
      token.symbol = "USDG";
      continue;
    }
    const quote = priced.get(key);
    if (quote) token.price = quote.price;
    const listedOnDex = pooled.has(key);
    const listedOnGecko = gecko.pooled.has(key);
    if (token.symbol.toUpperCase() === "USDG" && key !== USDG) tokens.delete(key);
    else if (!token.symbol || (!listedOnGecko && !listedOnDex && key !== USDG)) tokens.delete(key);
  }

  return {
    ethPrice,
    tokens: [...tokens.values()].filter((token) => token.symbol && token.address.toLowerCase() !== ZERO),
  };
}

let bookPromise: Promise<Book> | null = null;
let bookAt = 0;

function loadBook() {
  if (bookPromise && Date.now() - bookAt < BOOK_TTL) return bookPromise;
  bookAt = Date.now();
  bookPromise = buildBook().catch((error) => {
    bookPromise = null;
    throw error;
  });
  return bookPromise;
}

function sortHoldings(assets: Holding[]) {
  const native = assets.find((asset) => asset.symbol === "ETH" && asset.name === "Ether");
  const rest = assets.filter((asset) => asset !== native);
  const valueOf = (asset: Holding) => {
    if (asset.price == null) return null;
    const amount = Number(asset.amount);
    return Number.isFinite(amount) ? amount * asset.price : null;
  };
  rest.sort((a, b) => {
    const left = valueOf(a);
    const right = valueOf(b);
    if (left == null && right == null) return a.symbol.localeCompare(b.symbol);
    if (left == null) return 1;
    if (right == null) return -1;
    return right - left;
  });
  return native ? [native, ...rest] : rest;
}

export async function readHoldings(account: Address): Promise<Holding[]> {
  const book = await loadBook();
  const publicClient = client();
  const contracts = book.tokens.flatMap((token) => [
    { address: token.address, abi: erc20, functionName: "balanceOf" as const, args: [account] as const },
    { address: token.address, abi: erc20, functionName: "decimals" as const },
  ]);
  const calls = [];
  for (let index = 0; index < contracts.length; index += 80) {
    calls.push(
      publicClient.multicall({
        multicallAddress: MULTICALL,
        allowFailure: true,
        contracts: contracts.slice(index, index + 80),
      }),
    );
  }
  const [native, ...chunks] = await Promise.all([publicClient.getBalance({ address: account }), ...calls]);
  const results = chunks.flat();
  const assets: Holding[] = [
    {
      symbol: "ETH",
      name: "Ether",
      amount: formatUnits(native, 18),
      price: book.ethPrice,
      image: null,
      address: null,
    },
  ];

  book.tokens.forEach((token, index) => {
    const balance = results[index * 2];
    const decimals = results[index * 2 + 1];
    if (!balance || balance.status !== "success" || typeof balance.result !== "bigint" || balance.result <= BigInt(0)) return;
    const chainDecimals = decimals?.status === "success" && typeof decimals.result === "number" ? decimals.result : null;
    const places = token.address.toLowerCase() === USDG ? 6 : (chainDecimals ?? token.decimals);
    if (places == null || !Number.isInteger(places) || places < 0 || places > 36) return;
    assets.push({
      symbol: token.symbol,
      name: token.name || token.symbol,
      amount: formatUnits(balance.result, places),
      price: token.address.toLowerCase() === USDG ? 1 : token.price,
      image: token.image ?? null,
      address: token.address,
    });
  });

  return sortHoldings(assets);
}
