import { Arms, Cheeks, Eyes, Ground, MoodFx, Mouth, Root, Sheen, origin, type CharacterProps } from "../parts";

/** Tuck the turtle — keeper of long timelines. Pine shell with honey plates, cream rim, a patient sprout. */
export function Tuck({ mood }: CharacterProps) {
  return (
    <>
      <Ground rx={42} />
      <Root>
        <g fill="var(--m-sage-d)">
          <ellipse cx="30" cy="104" rx="9.5" ry="5" />
          <ellipse cx="90" cy="104" rx="9.5" ry="5" />
        </g>
        <g className="cm-ear" style={origin(60, 47)}>
          <path d="M60 47 Q59 41 60.5 37" stroke="var(--m-sage-d)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M60.5 39 Q55 33 50 36 Q54 41 60.5 39 Z" fill="var(--m-sage)" />
          <path d="M60.5 38 Q65 31 71 33 Q67 39 60.5 38 Z" fill="var(--m-sage-d)" />
        </g>
        <path d="M20 94 C20 64 38 46 60 46 C82 46 100 64 100 94 Z" fill="var(--m-pine)" />
        <Sheen cx={42} cy={58} rx={10} ry={4.6} rotate={-30} />
        <g fill="var(--m-honey)" opacity="0.88" strokeLinejoin="round" stroke="var(--m-honey)" strokeWidth="2">
          <path d="M50 59 Q60 52 70 59 L68 69 L52 69 Z" />
          <path d="M27 86 C27 78 31 71 37 67 L45 73 L43 86 Z" />
          <path d="M93 86 C93 78 89 71 83 67 L75 73 L77 86 Z" />
        </g>
        <rect x="16" y="89.5" width="88" height="9" rx="4.5" fill="var(--m-cream-2)" />
        <circle cx="60" cy="82" r="16.5" fill="var(--m-sage)" />
        <Sheen cx={53} cy={72} rx={5} ry={2.6} />
        <Cheeks mood={mood} l={[49.5, 87]} r={[70.5, 87]} rx={3} ry={1.8} />
        <Eyes mood={mood} l={[53.5, 80]} r={[66.5, 80]} size={3.8} />
        <Mouth mood={mood} at={[60, 88.5]} w={6} />
        {mood === "think" ? (
          <g transform="translate(92 54) rotate(10)">
            <rect x="-8" y="-5.5" width="16" height="11" rx="1.6" fill="var(--m-cream)" stroke="var(--m-oat-d)" strokeWidth="1" />
            <path d="M-7.4 -4.6 L0 1 L7.4 -4.6" fill="none" stroke="var(--m-oat-d)" strokeWidth="1" strokeLinejoin="round" />
          </g>
        ) : null}
        <Arms
          mood={mood}
          shoulders={{ l: [33, 93], r: [87, 93] }}
          rest={{ l: [26, 101], r: [94, 101] }}
          chin={[68, 95]}
          chest={[60, 99]}
          color="var(--m-sage-d)"
          w={9}
        />
      </Root>
      <MoodFx mood={mood} at={mood === "think" ? [26, 46] : [94, 40]} />
    </>
  );
}
