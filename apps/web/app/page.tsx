import Link from 'next/link';
import Panel from '../components/Panel';

export default function Page() {
  return <div className="space-y-6">
    <section className="rounded-3xl bg-ink px-8 py-12 text-white">
      <p className="text-xs uppercase tracking-[.3em] text-teal-200">PortfolioPilot / investment risk laboratory</p>
      <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight">A portfolio is more than<br />the sum of its holdings.</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300">Capital weights tell you where your money sits. Risk contributions tell you what can move it. Explore that difference with transparent calculations, benchmark evidence and explicit assumptions.</p>
      <Link href="/risk" className="mt-8 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold">Open the risk workbench →</Link>
    </section>
    <section className="grid gap-6 lg:grid-cols-3">
      <Panel title="01 / Diagnose an allocation" subtitle="What matters?"><p className="text-sm leading-relaxed text-muted">Supply daily adjusted prices and portfolio weights. Compare historical downside, total volatility and benchmark sensitivity. Every metric includes an economic interpretation.</p><Link className="mt-5 inline-block text-sm font-semibold text-accent" href="/risk">Analyze portfolio risk →</Link></Panel>
      <Panel title="02 / Challenge the weights" subtitle="Why does it matter?"><p className="text-sm leading-relaxed text-muted">Compare mean-variance, equal risk contribution and CVaR allocations. Historical expected returns are noisy; an efficient frontier is conditional on its inputs.</p><Link className="mt-5 inline-block text-sm font-semibold text-accent" href="/lab/optimizer">Explore optimization →</Link></Panel>
      <Panel title="03 / Test the path" subtitle="Show the evidence"><p className="text-sm leading-relaxed text-muted">Study chronological strategies with warm-up periods, holdings drift and explicit trading costs. A strong in-sample result is a research question, not a trading guarantee.</p><Link className="mt-5 inline-block text-sm font-semibold text-accent" href="/lab/backtest">Run a backtest →</Link></Panel>
    </section>
    <Panel title="The research question" subtitle="Low volatility does not mean absence of risk">
      <p className="max-w-4xl text-sm leading-relaxed text-muted">A 60% equity allocation can account for considerably more than 60% of portfolio volatility. Adding an asset only helps when its covariance with existing holdings compensates for its standalone risk. PortfolioPilot makes that trade-off visible, then asks what happens when historical relationships break under a user-defined shock.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-canvas p-4 text-sm"><strong>Transparent inputs</strong><p className="mt-2 text-xs text-muted">Your CSV or Yahoo adjusted prices. Teaching data is labeled and explicitly selected.</p></div><div className="rounded-xl bg-canvas p-4 text-sm"><strong>Reproducible evidence</strong><p className="mt-2 text-xs text-muted">Source, sample dates, assumptions and a SHA-256 hash accompany risk output.</p></div><div className="rounded-xl bg-canvas p-4 text-sm"><strong>Honest uncertainty</strong><p className="mt-2 text-xs text-muted">Missing data returns an error. Undefined ratios remain undefined.</p></div></div>
    </Panel>
  </div>;
}
