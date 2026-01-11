'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { label: 'Overview', href: '/' },
  { label: 'Backtest Lab', href: '/lab/backtest' },
  { label: 'Optimizer', href: '/lab/optimizer' },
  { label: 'Risk', href: '/risk' },
  { label: 'Live Markets', href: '/live' },
  { label: 'Runs', href: '/runs' },
  { label: 'Math', href: '/docs/math' }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-border bg-white px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">PortfolioPilot</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Quant Lab</h1>
        </div>
      </div>
      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'rounded-xl px-4 py-3 text-sm font-medium transition-none',
              pathname === item.href
                ? 'bg-accent text-white'
                : 'text-muted hover:bg-accentSoft hover:text-ink'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="rounded-xl border border-border bg-canvas px-4 py-3 text-xs text-muted">
        Market data and backtests cached locally for speed.
      </div>
    </aside>
  );
}
