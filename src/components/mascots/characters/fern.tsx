import { Arms, Cheeks, Eyes, MoodFx, Root, Sheen, type CharacterProps } from "../parts";

const MOUTH: Record<CharacterProps["mood"], string> = {
  idle: "M47 75 Q60 83 73 75",
  happy: "M45 74 Q60 87 75 74",
  cheer: "M46 74 Q60 93 74 74 Z",
  think: "M50 77 Q55 74.5 60 77 Q65 79.5 70 76.5",
  sleepy: "M53 77 Q60 79.5 67 77",
  comfort: "M50 76 Q60 81.5 70 76",
};

/** Fern the frog — tiny-step specialist. Sage body, eye bumps, cream belly, dark lily pad. */
export function Fern({ mood }: CharacterProps) {
  return (
    <>
      <path d="M60 106 L103.2 109.1 A46 9 0 1 0 95.2 111.8 Z" fill="var(--m-pine-d)" />
      <ellipse cx="54" cy="104.5" rx="28" ry="3.6" fill="var(--m-pine)" />
      <Root>
        <g fill="var(--m-sage-d)">
          <ellipse cx="30" cy="96" rx="13" ry="6.5" />
          <ellipse cx="90" cy="96" rx="13" ry="6.5" />
        </g>
        <ellipse cx="60" cy="82" rx="34" ry="22" fill="var(--m-sage)" />
        <circle cx="43" cy="58" r="13" fill="var(--m-sage)" />
        <circle cx="77" cy="58" r="13" fill="var(--m-sage)" />
        <Sheen cx={38} cy={50} rx={5} ry={3} />
        <Sheen cx={72} cy={50} rx={5} ry={3} />
        <ellipse cx="60" cy="93" rx="20" ry="11" fill="var(--m-cream)" />
        <Eyes mood={mood} l={[43, 58]} r={[77, 58]} size={4.8} sclera="var(--m-cream)" />
        <g fill="var(--m-ink)" opacity="0.6">
          <circle cx="57" cy="69.5" r="0.9" />
          <circle cx="63" cy="69.5" r="0.9" />
        </g>
        <Cheeks mood={mood} l={[35, 76]} r={[85, 76]} rx={5} ry={3} />
        {mood === "cheer" ? (
          <g>
            <path d={MOUTH.cheer} fill="var(--m-ink)" stroke="var(--m-ink)" strokeWidth="1" strokeLinejoin="round" />
            <ellipse cx="60" cy="80.5" rx="5" ry="2.4" fill="var(--m-blush)" />
          </g>
        ) : (
          <path d={MOUTH[mood]} fill="none" stroke="var(--m-ink)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        )}
        <Arms
          mood={mood}
          shoulders={{ l: [44, 87], r: [76, 87] }}
          rest={{ l: [46, 100], r: [74, 100] }}
          chin={[67, 80]}
          chest={[60, 89]}
          color="var(--m-sage-d)"
          w={6.5}
        />
      </Root>
      <MoodFx mood={mood} at={[96, 34]} />
    </>
  );
}
