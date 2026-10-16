import { Arms, Cheeks, Eyes, Ground, MoodFx, Root, Sheen, origin, type CharacterProps } from "../parts";

/** A slightly-too-large pencil, centered on where the paw grips it. */
function Pencil({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-3.6" y="-23" width="7.2" height="31" rx="1" fill="var(--m-honey)" />
      <rect x="-1.1" y="-23" width="2.2" height="31" fill="var(--m-honey-d)" opacity="0.55" />
      <rect x="-3.6" y="-28.5" width="7.2" height="5.5" rx="1.8" fill="var(--m-blush)" />
      <rect x="-3.6" y="-23.6" width="7.2" height="2.6" fill="var(--m-gray)" />
      <path d="M-3.6 8 L0 16.5 L3.6 8 Z" fill="var(--m-cream-2)" />
      <path d="M-1.4 13.2 L0 16.5 L1.4 13.2 Z" fill="var(--m-ink)" />
    </g>
  );
}

/** Nib the beaver — resume workshop lead. Bark fur, cream muzzle, two square teeth, paddle tail, honey pencil. */
export function Nib({ mood }: CharacterProps) {
  const pencil =
    mood === "comfort" ? null : mood === "cheer" ? (
      <Pencil x={30} y={62} rotate={-22} />
    ) : mood === "think" ? (
      <Pencil x={86} y={33} rotate={-62} />
    ) : (
      <Pencil x={42} y={90} rotate={-12} />
    );
  return (
    <>
      <Ground rx={32} />
      <Root>
        <g className="cm-tail" style={origin(76, 98)}>
          <g transform="rotate(-24 76 98)">
            <rect x="72" y="90" width="38" height="15" rx="7.5" fill="var(--m-bark-d)" />
            <path d="M83 93 l4.5 9 M91 93 l4.5 9 M99 93 l4.5 9" stroke="var(--m-bark)" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>
        <ellipse cx="60" cy="85" rx="27" ry="22.5" fill="var(--m-bark)" />
        <ellipse cx="60" cy="90" rx="16" ry="14.5" fill="var(--m-cream)" />
        <g fill="var(--m-bark-d)">
          <ellipse cx="49" cy="107" rx="6.5" ry="3.1" />
          <ellipse cx="71" cy="107" rx="6.5" ry="3.1" />
        </g>
        <g>
          <circle cx="40" cy="32" r="6.5" fill="var(--m-bark)" />
          <circle cx="40" cy="32" r="3.2" fill="var(--m-bark-d)" />
        </g>
        <g className="cm-ear" style={origin(80, 36)}>
          <circle cx="80" cy="32" r="6.5" fill="var(--m-bark)" />
          <circle cx="80" cy="32" r="3.2" fill="var(--m-bark-d)" />
        </g>
        <circle cx="60" cy="52" r="24" fill="var(--m-bark)" />
        <Sheen cx={47} cy={38} rx={8} ry={4.2} />
        <ellipse cx="60" cy="62" rx="13" ry="10" fill="var(--m-cream)" />
        <Cheeks mood={mood} l={[44.5, 59]} r={[75.5, 59]} rx={3.6} ry={2.2} />
        <Eyes mood={mood} l={[49, 46]} r={[71, 46]} size={4.6} />
        {mood === "cheer" ? <ellipse cx="60" cy="66" rx="5.2" ry="4.6" fill="var(--m-ink)" /> : null}
        <path
          d={mood === "think" ? "M55 63 Q58 61.8 60 63 Q63 64.6 65.5 62.4" : "M54 62 Q57 65 60 62.6 Q63 65 66 62"}
          fill="none"
          stroke="var(--m-ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <g fill="var(--m-white)" stroke="var(--m-ink)" strokeWidth="0.9" strokeLinejoin="round">
          <rect x="56.6" y="64.2" width="3.4" height="5.6" rx="1" />
          <rect x="60" y="64.2" width="3.4" height="5.6" rx="1" />
        </g>
        <ellipse cx="60" cy="56.5" rx="4.6" ry="3.2" fill="var(--m-ink)" />
        <circle cx="58.6" cy="55.6" r="1" fill="var(--m-white)" />
        {pencil}
        <Arms
          mood={mood}
          shoulders={{ l: [41, 79], r: [79, 79] }}
          rest={{ l: [43, 93], r: [77, 93] }}
          chin={[67, 69]}
          chest={[60, 86]}
          color="var(--m-bark-d)"
          w={7}
        />
      </Root>
      <MoodFx mood={mood} at={mood === "think" ? [24, 26] : [94, 24]} />
    </>
  );
}
