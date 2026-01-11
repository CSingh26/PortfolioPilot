import WebSocket from 'ws';
import { config } from '../config';
import { setLiveMode, setQuote } from './store';

let socket: WebSocket | null = null;
let demoTimer: NodeJS.Timeout | null = null;

function randomPrice(base: number): number {
  const drift = (Math.random() - 0.5) * 0.8;
  return Math.max(1, base + drift);
}

function startDemoFeed(): void {
  if (demoTimer) {
    return;
  }
  const prices = new Map<string, number>();
  config.liveSymbols.forEach((symbol, index) => {
    prices.set(symbol, 80 + index * 15 + Math.random() * 10);
  });

  setLiveMode('demo').catch(() => undefined);

  demoTimer = setInterval(async () => {
    const now = new Date().toISOString();
    await Promise.all(
      config.liveSymbols.map(async (symbol) => {
        const next = randomPrice(prices.get(symbol) ?? 100);
        prices.set(symbol, next);
        await setQuote({ symbol, price: Number(next.toFixed(2)), timestamp: now, source: 'demo' });
      })
    );
  }, 3000);
}

function connectFinnhub(): void {
  if (!config.finnhubApiKey) {
    startDemoFeed();
    return;
  }

  if (socket) {
    socket.terminate();
    socket = null;
  }

  socket = new WebSocket(`wss://ws.finnhub.io?token=${config.finnhubApiKey}`);

  socket.on('open', async () => {
    await setLiveMode('finnhub');
    config.liveSymbols.forEach((symbol) => {
      socket?.send(JSON.stringify({ type: 'subscribe', symbol }));
    });
  });

  socket.on('message', async (data) => {
    try {
      const payload = JSON.parse(data.toString());
      if (payload.type !== 'trade') {
        return;
      }
      const now = new Date().toISOString();
      await Promise.all(
        payload.data.map((tick: { s: string; p: number }) =>
          setQuote({ symbol: tick.s, price: tick.p, timestamp: now, source: 'finnhub' })
        )
      );
    } catch {
      // ignore malformed payloads
    }
  });

  socket.on('close', () => {
    setTimeout(connectFinnhub, 5000);
  });

  socket.on('error', () => {
    socket?.close();
  });
}

export function startFinnhubConsumer(): void {
  connectFinnhub();
}
