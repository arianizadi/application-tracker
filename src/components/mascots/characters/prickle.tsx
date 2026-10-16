import { Arms, Cheeks, Eyes, Ground, MoodFx, Mouth, Root, type CharacterProps } from "../parts";

/** A small mushroom (no career advice included). (x, y) is the base of the cap. */
function Mushroom({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3.3" y="-1.5" width="6.6" height="10" rx="2.6" fill="var(--m-cream-2)" />
      <path d="M-10.5 0.5 Q-11 -10.5 0 -10.5 Q11 -10.5 10.5 0.5 Z" fill="var(--m-clay)" />
      <g fill="var(--m-white)">
        <circle cx="-4.5" cy="-5" r="1.7" />
        <circle cx="3" cy="-7" r="1.4" />
        <circle cx="5.6" cy="-2.6" r="1.1" />
      </g>
    </g>
  );
}

const SPIKES = [
  { cx: 39.9, cy: 63.9, a: -48, back: true },
  { cx: 52.6, cy: 54.1, a: -16, back: true },
  { cx: 67.4, cy: 54.1, a: 16, back: true },
  { cx: 80.1, cy: 63.9, a: 48, back: true },
  { cx: 35.7, cy: 70.2, a: -64 },
  { cx: 45.7, cy: 59.1, a: -32 },
  { cx: 60, cy: 55, a: 0 },
  { cx: 74.3, cy: 59.1, a: 32 },
  { cx: 84.3, cy: 70.2, a: 64 },
];

/** Prickle the hedgehog — rejection companion. Broad soft pine spikes, cream face, a mushroom to hold. */
export function Prickle({ mood }: CharacterProps) {
  const hat = mood === "cheer";
  return (
    <>
      <Ground rx={31} />
      <Root>
        {SPIKES.map((s) => (
          <ellipse
            key={`${s.cx}-${s.cy}`}
            cx={s.cx}
            cy={s.cy}
            rx={s.back ? 8 : 9.5}
            ry={s.back ? 14 : 16}
            transform={`rotate(${s.a} ${s.cx} ${s.cy})`}
            fill={s.back ? "var(--m-pine-d)" : "var(--m-pine)"}
          />
        ))}
        <ellipse cx="60" cy="86" rx="29" ry="22" fill="var(--m-clay)" />
        <g fill="var(--m-cream)">
          <ellipse cx="49" cy="107" rx="6" ry="3" />
          <ellipse cx="71" cy="107" rx="6" ry="3" />
        </g>
        {hat ? <Mushroom x={60} y={59} s={1.1} /> : null}
        <circle cx="46" cy="64.5" r="4.5" fill="var(--m-clay)" />
        <circle cx="74" cy="64.5" r="4.5" fill="var(--m-clay)" />
        <circle cx="46" cy="64.5" r="2.2" fill="var(--m-clay-d)" />
        <circle cx="74" cy="64.5" r="2.2" fill="var(--m-clay-d)" />
        <circle cx="60" cy="78" r="17" fill="var(--m-cream)" />
        <Cheeks mood={mood} l={[48, 83.5]} r={[72, 83.5]} rx={3.4} ry={2.1} />
        <Eyes mood={mood} l={[53, 76]} r={[67, 76]} size={4} />
        <ellipse cx="60" cy="82.5" rx="3.2" ry="2.4" fill="var(--m-ink)" />
        <circle cx="59" cy="81.8" r="0.8" fill="var(--m-white)" />
        <Mouth mood={mood} at={[60, 87]} w={6} />
        {!hat ? <Mushroom x={60} y={mood === "comfort" ? 99 : 101} s={mood === "comfort" ? 1.15 : 1} /> : null}
        <Arms
          mood={mood}
          shoulders={{ l: [41, 92], r: [79, 92] }}
          rest={{ l: [55, 104], r: [65, 104] }}
          chin={[67, 90]}
          chest={[60, 102]}
          color="var(--m-clay-d)"
          paw="var(--m-cream)"
          w={6}
          pose={{ comfort: { l: [55, 102], r: [65, 102] }, think: { l: [56, 104] } }}
        />
      </Root>
      <MoodFx mood={mood} at={[95, 40]} />
    </>
  );
}
