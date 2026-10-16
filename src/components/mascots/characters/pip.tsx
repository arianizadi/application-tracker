import { Arms, Cheeks, Eyes, Ground, MoodFx, Mouth, Root, Sheen, origin, type CharacterProps } from "../parts";

/** Pip the fox — the interview friend. Clay fur, cream muzzle and tail tip, honey scarf. */
export function Pip({ mood }: CharacterProps) {
  const perky = mood === "cheer" || mood === "happy";
  return (
    <>
      <Ground rx={32} />
      <Root>
        <g className="cm-tail" style={origin(72, 100)}>
          <path d="M70 101 C93 107 109 93 105 72 C103 62 95 56 88 58 C93 71 88 85 69 92 Z" fill="var(--m-clay)" />
          <path d="M88 58 C95 56 103 62 105 72 C105.5 76 104.5 79 102.5 82 C99 73 95 65 88 58 Z" fill="var(--m-cream)" />
        </g>
        <rect x="44" y="72" width="32" height="36" rx="15" fill="var(--m-clay)" />
        <ellipse cx="60" cy="94" rx="10" ry="11" fill="var(--m-cream)" />
        <g fill="var(--m-bark-d)">
          <ellipse cx="51" cy="107" rx="6" ry="3.2" />
          <ellipse cx="69" cy="107" rx="6" ry="3.2" />
        </g>
        <g transform={perky ? "rotate(-6 44 46)" : undefined}>
          <path d="M35 56 L33 22.5 Q34.5 19.5 37.5 21.5 L56 44 Z" fill="var(--m-clay)" />
          <path d="M38.5 48 L37.5 29 L50 42.5 Z" fill="var(--m-bark-d)" />
        </g>
        <g className="cm-ear" style={origin(76, 46)}>
          <g transform={perky ? "rotate(6 76 46)" : undefined}>
            <path d="M85 56 L87 22.5 Q85.5 19.5 82.5 21.5 L64 44 Z" fill="var(--m-clay)" />
            <path d="M81.5 48 L82.5 29 L70 42.5 Z" fill="var(--m-bark-d)" />
          </g>
        </g>
        <path d="M60 84 C46 84 33 74 32 60 C31 50 40 42 60 42 C80 42 89 50 88 60 C87 74 74 84 60 84 Z" fill="var(--m-clay)" />
        <Sheen cx={46} cy={49} rx={8} ry={4} />
        <path d="M60 84 C50 84 42 77 42 68.5 C48 70 54 67.5 60 64 C66 67.5 72 70 78 68.5 C78 77 70 84 60 84 Z" fill="var(--m-cream)" />
        <Cheeks mood={mood} l={[43, 70]} r={[77, 70]} rx={3.6} ry={2.2} />
        <Eyes mood={mood} l={[48, 58]} r={[72, 58]} size={4.8} />
        <ellipse cx="60" cy="68.5" rx="3.8" ry="2.7" fill="var(--m-ink)" />
        <circle cx="58.8" cy="67.6" r="0.9" fill="var(--m-white)" />
        <Mouth mood={mood} at={[60, 73.5]} w={7} />
        <path d="M42 82 Q60 92 78 82 L79 88.5 Q60 98.5 41 88.5 Z" fill="var(--m-honey)" />
        <path d="M66 91 L80 103 L85 97.5 L71 88.5 Z" fill="var(--m-honey-d)" />
        <Arms
          mood={mood}
          shoulders={{ l: [46, 93], r: [74, 93] }}
          rest={{ l: [49, 103], r: [71, 103] }}
          chin={[68, 80]}
          chest={[60, 96]}
          color="var(--m-clay-d)"
          paw="var(--m-bark-d)"
          w={6.5}
        />
      </Root>
      <MoodFx mood={mood} at={[95, 28]} />
    </>
  );
}
