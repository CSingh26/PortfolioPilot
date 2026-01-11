type PageHeaderProps = {
  title: string;
  subtitle: string;
  badge?: string;
};

export default function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">{subtitle}</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">{title}</h2>
      </div>
      {badge ? (
        <span className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
