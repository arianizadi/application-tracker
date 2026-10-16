/** A wooden trail sign pointing three ways, for the 404 page. Decorative. */
export function TrailSign({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 220" className={className} aria-hidden>
      <ellipse cx="130" cy="206" rx="110" ry="10" fill="var(--moss)" opacity="0.18" />
      {/* bush on the right (the "definitely a bush" direction) */}
      <g fill="var(--leaf)">
        <circle cx="222" cy="186" r="20" />
        <circle cx="240" cy="192" r="14" />
        <circle cx="204" cy="194" r="13" />
      </g>
      <circle cx="226" cy="178" r="3" fill="var(--berry)" />
      <circle cx="236" cy="186" r="2.5" fill="var(--berry)" />
      {/* post */}
      <rect x="122" y="30" width="16" height="176" rx="5" fill="var(--bark)" />
      <path d="M126 60v130M134 48v40" stroke="var(--paper)" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
      {/* boards */}
      <g fontFamily="var(--font-display), Georgia, serif" fontWeight="600" fill="var(--paper)">
        <g className="origin-[130px_52px] animate-sway">
          <path d="M60 38h118l16 14-16 14H60a6 6 0 0 1-6-6V44a6 6 0 0 1 6-6Z" fill="var(--bark)" />
          <text x="118" y="57" textAnchor="middle" fontSize="15">Home</text>
        </g>
        <g>
          <path d="M200 82H82l-16 14 16 14h118a6 6 0 0 0 6-6V88a6 6 0 0 0-6-6Z" fill="var(--bark)" />
          <text x="140" y="101" textAnchor="middle" fontSize="13">Applications</text>
        </g>
        <g transform="rotate(8 130 140)">
          <path d="M52 126h134l16 14-16 14H52a6 6 0 0 1-6-6v-16a6 6 0 0 1 6-6Z" fill="var(--bark)" />
          <text x="122" y="145" textAnchor="middle" fontSize="12">Definitely a bush</text>
        </g>
      </g>
      {/* little mushrooms at the base */}
      <path d="M100 206c0-8 5-12 10-12s10 4 10 12Z" fill="var(--coral)" />
      <rect x="107" y="200" width="6" height="7" rx="2" fill="var(--card)" />
    </svg>
  );
}
