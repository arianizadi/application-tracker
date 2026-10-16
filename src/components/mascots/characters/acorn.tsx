import { Arms, Cheeks, Eyes, Ground, MoodFx, Mouth, Root, Sheen, origin, type CharacterProps } from "../parts";

function Notebook({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-12" y="-9" width="24" height="18" rx="2.2" fill="var(--m-sage)" />
      <rect x="-12" y="-9" width="4.2" height="18" rx="1.6" fill="var(--m-sage-d)" />
      <path d="M2.5 -5.5 C8 -3.5 8 3.5 2.5 5.5 C-3 3.5 -3 -3.5 2.5 -5.5 Z" fill="var(--m-honey)" />
      <path d="M2.5 -4 L2.5 4.5" stroke="var(--m-honey-d)" strokeWidth="0.9" strokeLinecap="round" />
    </g>
  );
}

function TinyAcorn({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(18)`}>
      <ellipse cx="0" cy="3" rx="5" ry="6" fill="var(--m-honey-d)" />
      <path d="M-6 0.5 Q0 -7 6 0.5 Z" fill="var(--m-bark-d)" />
      <path d="M0 -3.5 L0.8 -6.5" stroke="var(--m-bark-d)" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/** Acorn the squirrel — progress archivist. Honey fur, clay curl tail, sage notebook with a leaf. */
export function Acorn({ mood }: CharacterProps) {
  return (
    <>
      <Ground rx={30} />
      <Root>
        <g className="cm-tail" style={origin(72, 102)}>
          <path
            d="M70 102 C96 102 108 74 98 52 C92 38 76 36 74 48 C73 56 82 58 84 52"
            fill="none"
            stroke="var(--m-clay)"
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M92 90 C100 80 103 68 99 56" fill="none" stroke="var(--m-sheen)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <ellipse cx="56" cy="88" rx="22" ry="20" fill="var(--m-honey)" />
        <ellipse cx="56" cy="92" rx="13" ry="13" fill="var(--m-cream)" />
        <g fill="var(--m-honey-d)">
          <ellipse cx="46" cy="107" rx="6.5" ry="3" />
          <ellipse cx="66" cy="107" rx="6.5" ry="3" />
        </g>
        <path d="M39.5 45 Q35 31 39.5 23 Q41 21.5 42.5 23 Q50 29 53 38 Z" fill="var(--m-honey-d)" />
        <path d="M42 41 Q39.5 32 41.5 27 Q47 31 49 37.5 Z" fill="var(--m-clay)" />
        <g className="cm-ear" style={origin(68, 40)}>
          <path d="M72.5 45 Q77 31 72.5 23 Q71 21.5 69.5 23 Q62 29 59 38 Z" fill="var(--m-honey-d)" />
          <path d="M70 41 Q72.5 32 70.5 27 Q65 31 63 37.5 Z" fill="var(--m-clay)" />
        </g>
        <circle cx="56" cy="54" r="20" fill="var(--m-honey)" />
        <Sheen cx={46} cy={42} rx={7} ry={3.8} />
        <ellipse cx="56" cy="62" rx="10" ry="7.5" fill="var(--m-cream)" />
        <Cheeks mood={mood} l={[42, 60]} r={[70, 60]} rx={3.4} ry={2.1} />
        <Eyes mood={mood} l={[48, 52]} r={[64, 52]} size={4.4} />
        <ellipse cx="56" cy="58.5" rx="3" ry="2.2" fill="var(--m-ink)" />
        <Mouth mood={mood} at={[56, 63.4]} w={5.5} />
        {mood === "cheer" ? <TinyAcorn x={56} y={20} /> : <Notebook x={56} y={88} />}
        <Arms
          mood={mood}
          shoulders={{ l: [40, 78], r: [72, 78] }}
          rest={{ l: [45, 88], r: [67, 88] }}
          chin={[63, 67]}
          chest={[56, 86]}
          color="var(--m-honey-d)"
          w={6.5}
        />
      </Root>
      <MoodFx mood={mood} at={[26, 24]} />
    </>
  );
}
