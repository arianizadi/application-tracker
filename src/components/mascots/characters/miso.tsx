import { Arms, Cheeks, Eyes, Ground, MoodFx, Mouth, Root, Sheen, origin, type CharacterProps } from "../parts";

function Leaf({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d="M0 -9.5 C6.5 -6 7.5 3.5 0 9.5 C-7.5 3.5 -6.5 -6 0 -9.5 Z" fill="var(--m-honey)" />
      <path d="M0 -7 L0 8.5" stroke="var(--m-honey-d)" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

/** Miso the otter — celebration host. Brown capsule body, cream muzzle and belly, a honey leaf to wave. */
export function Miso({ mood }: CharacterProps) {
  return (
    <>
      <Ground rx={28} />
      <Root>
        <g className="cm-tail" style={origin(74, 104)}>
          <ellipse cx="89" cy="104" rx="17" ry="5.5" transform="rotate(-12 89 104)" fill="var(--m-bark-d)" />
        </g>
        <circle cx="42" cy="38" r="4.6" fill="var(--m-bark-d)" />
        <g className="cm-ear" style={origin(78, 40)}>
          <circle cx="78" cy="38" r="4.6" fill="var(--m-bark-d)" />
        </g>
        <rect x="38" y="30" width="44" height="78" rx="22" fill="var(--m-bark)" />
        <Sheen cx={48} cy={41} rx={7} ry={3.8} />
        <ellipse cx="60" cy="89" rx="15" ry="17" fill="var(--m-cream)" />
        <g fill="var(--m-bark-d)">
          <ellipse cx="50" cy="107.5" rx="6" ry="3" />
          <ellipse cx="70" cy="107.5" rx="6" ry="3" />
        </g>
        <ellipse cx="60" cy="61" rx="12.5" ry="8.5" fill="var(--m-cream)" />
        <Cheeks mood={mood} l={[44.5, 59]} r={[75.5, 59]} rx={3.4} ry={2.1} />
        <Eyes mood={mood} l={[50, 50]} r={[70, 50]} size={4.6} />
        <path d="M56 55.6 h8 q0 3.4 -4 4.6 q-4 -1.2 -4 -4.6 Z" fill="var(--m-ink)" />
        <Mouth mood={mood} at={[60, 63.4]} w={6} />
        <g stroke="var(--m-bark-d)" strokeWidth="0.9" strokeLinecap="round" opacity="0.8">
          <path d="M49 61 L40 59 M49 63.5 L40.5 64.5 M71 61 L80 59 M71 63.5 L79.5 64.5" />
        </g>
        {mood === "cheer" ? <Leaf x={60} y={16} rotate={28} /> : mood === "think" ? <Leaf x={56} y={84} rotate={-18} /> : <Leaf x={60} y={80} rotate={8} />}
        <Arms
          mood={mood}
          shoulders={{ l: [42, 73], r: [78, 73] }}
          rest={{ l: [55, 82], r: [65, 82] }}
          chin={[66, 67]}
          chest={[60, 81]}
          color="var(--m-bark-d)"
          w={7}
          pose={{ think: { l: [53, 86] } }}
        />
      </Root>
      <MoodFx mood={mood} at={[92, 26]} />
    </>
  );
}
