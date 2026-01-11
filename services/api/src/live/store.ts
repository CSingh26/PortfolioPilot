import { redis } from '../redis';

export type LiveQuote = {
  symbol: string;
  price: number;
  timestamp: string;
  source: 'finnhub' | 'demo';
};

const QUOTE_HASH = 'live:quotes';
const UPDATED_AT_KEY = 'live:updated_at';
const MODE_KEY = 'live:mode';

export async function setLiveMode(mode: LiveQuote['source']): Promise<void> {
  await redis.set(MODE_KEY, mode);
}

export async function setQuote(quote: LiveQuote): Promise<void> {
  await redis.hSet(QUOTE_HASH, quote.symbol, JSON.stringify(quote));
  await redis.set(UPDATED_AT_KEY, quote.timestamp);
}

export async function getQuotes(symbols: string[]): Promise<LiveQuote[]> {
  if (symbols.length === 0) {
    return [];
  }
  const payloads = await redis.hmGet(QUOTE_HASH, symbols);
  return payloads
    .map((payload, index) => {
      if (!payload) {
        return null;
      }
      try {
        return JSON.parse(payload) as LiveQuote;
      } catch {
        return {
          symbol: symbols[index],
          price: 0,
          timestamp: new Date().toISOString(),
          source: 'demo'
        } satisfies LiveQuote;
      }
    })
    .filter((quote): quote is LiveQuote => quote !== null);
}

export async function getLastUpdate(): Promise<string | null> {
  return redis.get(UPDATED_AT_KEY);
}

export async function getLiveMode(): Promise<string | null> {
  return redis.get(MODE_KEY);
}
