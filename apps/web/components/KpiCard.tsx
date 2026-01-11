import Panel from './Panel';

type KpiCardProps = {
  label: string;
  value: string;
  change: string;
};

export default function KpiCard({ label, value, change }: KpiCardProps) {
  return (
    <Panel>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-ink">{value}</p>
        <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-medium text-ink">
          {change}
        </span>
      </div>
    </Panel>
  );
}
