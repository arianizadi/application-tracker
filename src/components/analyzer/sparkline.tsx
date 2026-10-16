/** Tiny single-series score trend (0–100). Native <title> on each point gives a hover readout. */
export function Sparkline({
  values,
  labels,
  className = "h-7 w-24",
  label,
}: {
  values: number[];
  /** Optional per-point label for the hover title (e.g. dates). */
  labels?: string[];
  className?: string;
  label: string;
}) {
  const W = 96;
  const H = 28;
  const pad = 4;
  if (values.length === 0) return null;
  const x = (i: number) => (values.length === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (values.length - 1));
  const y = (v: number) => H - pad - (Math.max(0, Math.min(100, v)) / 100) * (H - pad * 2);
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values.length - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={label} preserveAspectRatio="none">
      <line x1={pad} x2={W - pad} y1={y(50)} y2={y(50)} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
      {values.length > 1 ? (
        <polyline points={points} fill="none" stroke="var(--moss)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ) : null}
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === last ? 3.2 : 1.6} fill={i === last ? "var(--moss)" : "var(--card)"} stroke="var(--moss)" strokeWidth="1.2">
          <title>{`${labels?.[i] ? `${labels[i]}: ` : ""}${v}%`}</title>
        </circle>
      ))}
    </svg>
  );
}
