export function MetricCard({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  const loading = value === '—';
  return (
    <article className="metric" aria-busy={loading || undefined}>
      <p>{label}</p>
      <strong className={loading ? 'skeleton' : undefined}>
        {loading ? <span className="sr-only">Loading</span> : value}
        <em>{suffix}</em>
      </strong>
      <span>LIVE</span>
    </article>
  );
}
