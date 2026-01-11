const DEFAULT_SYMBOLS = [
  'SPY',
  'QQQ',
  'IWM',
  'EFA',
  'EEM',
  'AGG',
  'GLD',
  'VNQ',
  'TLT',
  'LQD'
];

export const config = {
  finnhubApiKey: process.env.FINNHUB_API_KEY ?? '',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  liveSymbols: (process.env.LIVE_SYMBOLS ?? DEFAULT_SYMBOLS.join(','))
    .split(',')
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
};
