import { Arms, Cheeks, Eyes, Ground, MoodFx, Mouth, Root, origin, type CharacterProps } from "../parts";

/** Dot the moth — evening desk friend. Lavender wings with cream spots, perched on a warm lantern. */
export function Dot({ mood }: CharacterProps) {
  return (
    <>
      <Ground rx={18} />
      <circle className="cm-glow" cx="60" cy="92" r="15" fill="var(--m-honey)" opacity="0.22" />
      <rect x="49" y="102" width="22" height="5" rx="2.5" fill="var(--m-bark-d)" />
      <rect x="52" y="82" width="16" height="20" rx="4" fill="var(--m-honey)" fillOpacity="0.3" stroke="var(--m-bark-d)" strokeWidth="1.6" />
      <path d="M60 86 C63.4 90 63.4 95.5 60 97.5 C56.6 95.5 56.6 90 60 86 Z" fill="var(--m-honey)" />
      <rect x="50" y="78" width="20" height="5" rx="2.5" fill="var(--m-bark-d)" />
      <Root>
        <g className="cm-wing" style={origin(60, 60)}>
          <path d="M57 56 C44 30 18 28 16 46 C14 62 34 70 57 63 Z" fill="var(--m-lav)" />
          <path d="M63 56 C76 30 102 28 104 46 C106 62 86 70 63 63 Z" fill="var(--m-lav)" />
          <path d="M57 62 C42 66 32 80 40 86 C47 91 56 80 58 68 Z" fill="var(--m-lav-d)" />
          <path d="M63 62 C78 66 88 80 80 86 C73 91 64 80 62 68 Z" fill="var(--m-lav-d)" />
          <g fill="var(--m-cream)">
            <circle cx="31" cy="46" r="5" />
            <circle cx="42.5" cy="56.5" r="2.6" />
            <circle cx="89" cy="46" r="5" />
            <circle cx="77.5" cy="56.5" r="2.6" />
            <circle cx="44" cy="79" r="2.4" />
            <circle cx="76" cy="79" r="2.4" />
          </g>
          <path d="M22 44 Q30 36 40 39 M98 44 Q90 36 80 39" fill="none" stroke="var(--m-white)" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <path d="M57 77.5 L55.5 80 M63 77.5 L64.5 80" stroke="var(--m-pine-d)" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="60" cy="64" rx="7.5" ry="15" fill="var(--m-pine)" />
        <path d="M53.5 67 Q60 69 66.5 67 M54 72 Q60 74 66 72" fill="none" stroke="var(--m-pine-d)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="60" cy="54" r="8.5" fill="var(--m-cream-2)" />
        <path d="M55 35 C52 26 46 22 40 22" fill="none" stroke="var(--m-honey)" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="40" cy="22" r="2.4" fill="var(--m-honey)" />
        <g className="cm-ear" style={origin(65, 35)}>
          <path d="M65 35 C68 26 74 22 80 22" fill="none" stroke="var(--m-honey)" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="80" cy="22" r="2.4" fill="var(--m-honey)" />
        </g>
        <circle cx="60" cy="44" r="12" fill="var(--m-cream)" />
        <Cheeks mood={mood} l={[50.5, 49]} r={[69.5, 49]} rx={2.6} ry={1.6} />
        <Eyes mood={mood} l={[54.5, 43.5]} r={[65.5, 43.5]} size={3.9} />
        <Mouth mood={mood} at={[60, 50.5]} w={5} />
        <Arms
          mood={mood}
          shoulders={{ l: [55, 61], r: [65, 61] }}
          rest={{ l: [54, 71], r: [66, 71] }}
          chin={[63, 53]}
          chest={[60, 63]}
          color="var(--m-pine-d)"
          w={3.4}
          pose={{ idle: null, sleepy: null }}
        />
      </Root>
      <MoodFx mood={mood} at={[96, 22]} />
    </>
  );
}
