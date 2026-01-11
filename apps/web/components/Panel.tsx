import { ReactNode } from 'react';
import clsx from 'clsx';

type PanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export default function Panel({ title, subtitle, children, className }: PanelProps) {
  return (
    <section className={clsx('rounded-2xl border border-border bg-white p-6 shadow-soft', className)}>
      {title ? (
        <header className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">{title}</h3>
          {subtitle ? <p className="mt-2 text-lg font-semibold text-ink">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
