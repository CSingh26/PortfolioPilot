import WebSocket from 'ws';
import { config } from '../config';
import { setLiveMode, setQuote } from './store';

let socket: WebSocket | null = null;
function connectFinnhub(): void {
  if (!config.finnhubApiKey) {
    setLiveMode('unavailable').catch(() => undefined);
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
    setLiveMode('unavailable').catch(() => undefined);
    setTimeout(connectFinnhub, 5000);
  });

  socket.on('error', () => {
    socket?.close();
  });
}

export function startFinnhubConsumer(): void {
  connectFinnhub();
}
