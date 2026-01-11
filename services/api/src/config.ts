import fs from 'fs';
import path from 'path';

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

const defaultRoot = fs.existsSync(path.join(process.cwd(), 'data'))
  ? process.cwd()
  : path.resolve(process.cwd(), '..', '..');

export const config = {
  finnhubApiKey: process.env.FINNHUB_API_KEY ?? '',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  runsDir: process.env.RUNS_DIR ?? path.join(defaultRoot, 'data', 'runs'),
  liveSymbols: (process.env.LIVE_SYMBOLS ?? DEFAULT_SYMBOLS.join(','))
    .split(',')
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
};
