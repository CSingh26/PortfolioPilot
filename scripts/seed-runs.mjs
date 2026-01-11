const API_URL = process.env.API_URL ?? 'http://localhost:4000';

const sampleResults = {
  run_id: 'seed',
  summary: { cagr: 0.12, vol: 0.18, sharpe: 1.1, max_drawdown: -0.08, calmar: 1.5 },
  equity_curve: {
    dates: ['2023-01-31', '2023-06-30', '2023-12-29'],
    values: [1, 1.05, 1.14]
  },
  returns: {
    dates: ['2023-01-31', '2023-06-30', '2023-12-29'],
    values: [0.01, 0.02, 0.015]
  },
  drawdown: {
    dates: ['2023-01-31', '2023-06-30', '2023-12-29'],
    values: [0, -0.03, -0.01]
  },
  weights: {
    dates: ['2023-01-31', '2023-06-30', '2023-12-29'],
    weights: {
      SPY: [0.4, 0.35, 0.3],
      QQQ: [0.3, 0.32, 0.34],
      IWM: [0.3, 0.33, 0.36]
    }
  },
  turnover: {
    dates: ['2023-01-31', '2023-06-30', '2023-12-29'],
    values: [0.1, 0.12, 0.08]
  },
  costs: {
    dates: ['2023-01-31', '2023-06-30', '2023-12-29'],
    values: [0.0006, 0.0007, 0.0005]
  }
};

const seedRuns = [
  {
    name: 'Risk Parity 2019-2024',
    strategy: 'risk_parity',
    config: {
      tickers: ['SPY', 'QQQ', 'IWM', 'EFA', 'EEM'],
      start: '2019-01-01',
      end: '2024-12-31',
      rebalance: 'M'
    },
    summary: sampleResults.summary,
    results: sampleResults
  },
  {
    name: 'Momentum 12-1 2018-2024',
    strategy: 'momentum_12_1',
    config: {
      tickers: ['SPY', 'QQQ', 'IWM', 'EFA', 'EEM'],
      start: '2018-01-01',
      end: '2024-12-31',
      rebalance: 'M'
    },
    summary: sampleResults.summary,
    results: sampleResults
  }
];

async function seed() {
  for (const run of seedRuns) {
    const response = await fetch(`${API_URL}/v1/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(run)
    });
    if (!response.ok) {
      console.error('Failed to seed run', await response.text());
      process.exitCode = 1;
    }
  }
  console.log('Seeded sample runs');
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exitCode = 1;
});
