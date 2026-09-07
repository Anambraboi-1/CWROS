export function MetricCard({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <article className="metric">
      <p>{label}</p>
      <strong>
        {value}
        <em>{suffix}</em>
      </strong>
      <span>LIVE</span>
    </article>
  );
}
