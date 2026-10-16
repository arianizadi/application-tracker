import { Arms, Cheeks, Eyes, Ground, MoodFx, Mouth, Root, Sheen, origin, type CharacterProps } from "../parts";

/** Clover the rabbit — quick-add concierge. Oat fur, one bent ear, sage satchel. */
export function Clover({ mood }: CharacterProps) {
  return (
    <>
      <Ground rx={27} />
      <Root>
        <g className="cm-ear" style={origin(50, 40)}>
          <ellipse cx="49" cy="22" rx="7.5" ry="19" transform="rotate(-8 49 22)" fill="var(--m-oat)" />
          <ellipse cx="49" cy="23.5" rx="3.6" ry="13" transform="rotate(-8 49 23.5)" fill="var(--m-blush)" opacity="0.75" />
        </g>
        <g>
          <ellipse cx="70" cy="28" rx="7" ry="12.5" transform="rotate(10 70 28)" fill="var(--m-oat)" />
          <ellipse cx="79" cy="15" rx="6.5" ry="10" transform="rotate(62 79 15)" fill="var(--m-oat)" />
          <ellipse cx="70" cy="29.5" rx="3.3" ry="8" transform="rotate(10 70 29.5)" fill="var(--m-blush)" opacity="0.75" />
          <ellipse cx="80" cy="14.6" rx="3" ry="6.4" transform="rotate(62 80 14.6)" fill="var(--m-blush)" opacity="0.75" />
        </g>
        <path d="M60 66 C73 66 84 80 84 92 C84 103 74 108 60 108 C46 108 36 103 36 92 C36 80 47 66 60 66 Z" fill="var(--m-oat)" />
        <ellipse cx="60" cy="95" rx="14" ry="11.5" fill="var(--m-cream)" />
        <g fill="var(--m-oat-d)">
          <ellipse cx="48" cy="107" rx="8" ry="3.6" />
          <ellipse cx="72" cy="107" rx="8" ry="3.6" />
        </g>
        <path d="M45 72 L79 96" stroke="var(--m-sage-d)" strokeWidth="3" strokeLinecap="round" />
        <rect x="68" y="88" width="17" height="14" rx="3.5" fill="var(--m-sage)" />
        <path d="M68 92 Q76.5 97 85 92 L85 91.5 Q85 88 81.5 88 L71.5 88 Q68 88 68 91.5 Z" fill="var(--m-sage-d)" />
        <circle cx="76.5" cy="94.6" r="1.4" fill="var(--m-honey)" />
        <circle cx="60" cy="52" r="20" fill="var(--m-oat)" />
        <Sheen cx={50} cy={41} rx={7} ry={3.8} />
        <ellipse cx="60" cy="61" rx="9" ry="6.5" fill="var(--m-cream)" />
        <Cheeks mood={mood} l={[46.5, 59]} r={[73.5, 59]} rx={3.6} ry={2.2} />
        <Eyes mood={mood} l={[52, 51]} r={[68, 51]} size={4.2} />
        <path d="M57.6 57.4 h4.8 q0 2.6 -2.4 3.4 q-2.4 -0.8 -2.4 -3.4 Z" fill="var(--m-clay)" />
        <Mouth mood={mood} at={[60, 63]} w={5.5} />
        <g stroke="var(--m-oat-d)" strokeWidth="0.9" strokeLinecap="round">
          <path d="M47 59 L38 57 M47 61.5 L38.5 62.5 M73 59 L82 57 M73 61.5 L81.5 62.5" />
        </g>
        <Arms
          mood={mood}
          shoulders={{ l: [46, 76], r: [74, 76] }}
          rest={{ l: [48, 90], r: [73, 91] }}
          chin={[66, 64]}
          chest={[60, 82]}
          color="var(--m-oat-d)"
          w={6}
        />
      </Root>
      <MoodFx mood={mood} at={[96, 36]} />
    </>
  );
}
