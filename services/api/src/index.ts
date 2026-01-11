import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { startFinnhubConsumer } from './live/finnhub';
import { getLastUpdate, getLiveMode, getQuotes } from './live/store';
import { prisma } from './prisma';
import { connectRedis } from './redis';
import { loadRunArtifacts, saveRunArtifacts } from './runs';

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

app.post('/v1/runs', async (req, res) => {
  const { name, strategy, config: runConfig, summary, results } = req.body ?? {};
  if (!strategy || !runConfig) {
    res.status(400).json({ error: 'strategy and config are required' });
    return;
  }

  const run = await prisma.backtestRun.create({
    data: {
      name: name ?? null,
      strategy,
      config: runConfig,
      summary: summary ?? null
    }
  });

  let resultsPath: string | null = null;
  if (results) {
    resultsPath = await saveRunArtifacts(run.id, results);
    await prisma.backtestRun.update({
      where: { id: run.id },
      data: { resultsPath }
    });
  }

  res.status(201).json({ ...run, resultsPath });
});

app.get('/v1/runs/:id', async (req, res) => {
  const run = await prisma.backtestRun.findUnique({ where: { id: req.params.id } });
  if (!run) {
    res.status(404).json({ error: 'Run not found' });
    return;
  }
  res.json(run);
});

app.get('/v1/runs/:id/export', async (req, res) => {
  const run = await prisma.backtestRun.findUnique({ where: { id: req.params.id } });
  if (!run) {
    res.status(404).json({ error: 'Run not found' });
    return;
  }
  const results = run.resultsPath ? await loadRunArtifacts(run.resultsPath) : null;
  res.json({ run, results });
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

const quantBaseUrl = process.env.QUANT_URL ?? 'http://localhost:8000';

async function proxyQuant(path: string, req: express.Request, res: express.Response) {
  try {
    const response = await fetch(`${quantBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {})
    });
    const payload = await response.json();
    res.status(response.status).json(payload);
  } catch (error) {
    res.status(502).json({ error: 'Quant service unavailable', detail: String(error) });
  }
}

app.post('/v1/quant/backtest', (req, res) => proxyQuant('/v1/backtest', req, res));
app.post('/v1/quant/optimize', (req, res) => proxyQuant('/v1/optimize', req, res));
app.post('/v1/quant/risk/metrics', (req, res) => proxyQuant('/v1/risk/metrics', req, res));
app.post('/v1/quant/risk/factors', (req, res) => proxyQuant('/v1/risk/factors', req, res));

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
