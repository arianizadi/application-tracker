export function Logo({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <rect width="40" height="40" rx="12" fill="var(--moss)" />
      <path d="M20 8c-5 6-9 9.5-9 14.5a9 9 0 0 0 18 0C29 17.5 25 14 20 8Z" fill="var(--leaf)" />
      <path d="M20 31V20m0 4.5 4-3.5m-4 1-3-2.5" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="29.5" cy="10.5" r="3" fill="var(--sun)" />
    </svg>
  );
}
