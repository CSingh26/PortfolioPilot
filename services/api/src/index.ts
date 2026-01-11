import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { startFinnhubConsumer } from './live/finnhub';
import { getLastUpdate, getLiveMode, getQuotes } from './live/store';
import { prisma } from './prisma';
import { connectRedis } from './redis';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/v1/health', async (_req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

app.get('/v1/runs', async (_req, res) => {
  const runs = await prisma.backtestRun.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  res.json(runs);
});

app.get('/v1/live/quotes', async (req, res) => {
  const symbolsParam = typeof req.query.symbols === 'string' ? req.query.symbols : '';
  const symbols = (symbolsParam || config.liveSymbols.join(','))
    .split(',')
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
  const quotes = await getQuotes(symbols);
  res.json({
    symbols,
    mode: await getLiveMode(),
    lastUpdated: await getLastUpdate(),
    quotes
  });
});

async function start() {
  await connectRedis();
  startFinnhubConsumer();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on ${port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
