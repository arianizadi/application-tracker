import { Arms, Cheeks, Eyes, Ground, MoodFx, Root, Sheen, origin, type CharacterProps } from "../parts";

/** Alder the owl — the practical mentor. Pine body, cream face discs, honey beak, one raised brow. */
export function Alder({ mood }: CharacterProps) {
  return (
    <>
      <Ground rx={26} />
      <Root>
        <g className="cm-ear" style={origin(42, 42)}>
          <path d="M41 44 Q33 35 30.5 23.5 Q31.5 22 33 22.8 Q42 29 52 37 Z" fill="var(--m-pine-d)" />
        </g>
        <path d="M79 44 Q87 35 89.5 23.5 Q88.5 22 87 22.8 Q78 29 68 37 Z" fill="var(--m-pine-d)" />
        <ellipse cx="60" cy="70" rx="31" ry="35" fill="var(--m-pine)" />
        <Sheen cx={45} cy={46} rx={9} ry={4.5} />
        <ellipse cx="60" cy="85" rx="19" ry="18.5" fill="var(--m-cream)" />
        <path
          d="M50 81 q3.5 3.2 7 0 M63 81 q3.5 3.2 7 0 M56.5 89 q3.5 3.2 7 0 M50 97 q3.5 3.2 7 0 M63 97 q3.5 3.2 7 0"
          fill="none"
          stroke="var(--m-cream-2)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <g fill="var(--m-honey)">
          <ellipse cx="51" cy="105" rx="5.5" ry="3" />
          <ellipse cx="69" cy="105" rx="5.5" ry="3" />
        </g>
        <circle cx="47.5" cy="56" r="13.5" fill="var(--m-cream)" />
        <circle cx="72.5" cy="56" r="13.5" fill="var(--m-cream)" />
        <Cheeks mood={mood} l={[41, 65]} r={[79, 65]} rx={3.6} ry={2.2} />
        <Eyes mood={mood} l={[47.5, 56.5]} r={[72.5, 56.5]} size={5.2} />
        {mood === "idle" || mood === "happy" ? (
          <path d="M64 41.5 Q72.5 36 81 40.5" fill="none" stroke="var(--m-ink)" strokeOpacity="0.7" strokeWidth="2.2" strokeLinecap="round" />
        ) : null}
        {mood === "cheer" ? (
          <g>
            <ellipse cx="60" cy="67" rx="4.2" ry="3.2" fill="var(--m-ink)" />
            <path d="M55.5 65 L60 59.5 L64.5 65 Z" fill="var(--m-honey)" strokeLinejoin="round" stroke="var(--m-honey)" strokeWidth="1" />
            <path d="M56.8 68.5 L60 74 L63.2 68.5 Z" fill="var(--m-honey-d)" strokeLinejoin="round" stroke="var(--m-honey-d)" strokeWidth="1" />
          </g>
        ) : (
          <path d="M60 60.5 L55.5 66 L60 72.5 L64.5 66 Z" fill="var(--m-honey)" strokeLinejoin="round" stroke="var(--m-honey)" strokeWidth="1.2" />
        )}
        <Arms
          mood={mood}
          shoulders={{ l: [33, 66], r: [87, 66] }}
          rest={{ l: [35, 88], r: [85, 88] }}
          chin={[68, 75]}
          chest={[60, 82]}
          color="var(--m-pine-d)"
          w={10}
        />
      </Root>
      <MoodFx mood={mood} at={[94, 28]} />
    </>
  );
}
