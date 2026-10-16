import { Arms, Cheeks, Eyes, Ground, MoodFx, Mouth, Root, origin, type CharacterProps } from "../parts";

/** Magnifying glass; (x, y) is the lens center, handle extends toward +x+y before rotation. */
function Glass({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d="M5.6 5.6 L12 12" stroke="var(--m-bark-d)" strokeWidth="3.6" strokeLinecap="round" />
      <circle r="8" fill="var(--m-sky)" fillOpacity="0.35" stroke="var(--m-honey)" strokeWidth="2.6" />
      <path d="M-4 -3.5 Q-2.5 -5.5 0 -5.8" fill="none" stroke="var(--m-white)" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </g>
  );
}

/** Rue the raccoon — keyword detective. Lavender-gray fur, dark mask, banded tail, honey magnifier. */
export function Rue({ mood }: CharacterProps) {
  return (
    <>
      <Ground rx={30} />
      <Root>
        <g className="cm-tail" style={origin(76, 102)}>
          <circle cx="101" cy="62" r="6.2" fill="var(--m-mask)" />
          <circle cx="101.5" cy="70.5" r="7" fill="var(--m-gray)" />
          <circle cx="99" cy="79.5" r="7.6" fill="var(--m-mask)" />
          <circle cx="94" cy="88" r="8" fill="var(--m-gray)" />
          <circle cx="87" cy="95" r="8.2" fill="var(--m-mask)" />
          <circle cx="79" cy="101" r="8" fill="var(--m-gray)" />
        </g>
        <ellipse cx="60" cy="88" rx="23" ry="19.5" fill="var(--m-gray)" />
        <ellipse cx="60" cy="93" rx="13" ry="12" fill="var(--m-cream)" />
        <g fill="var(--m-mask)">
          <ellipse cx="50" cy="106.5" rx="6" ry="3" />
          <ellipse cx="70" cy="106.5" rx="6" ry="3" />
        </g>
        <path d="M36 45 L38 24 Q39 21 42 23 L54 36 Z" fill="var(--m-gray-d)" />
        <path d="M40.5 38.5 L41.3 28.5 L48.8 35.5 Z" fill="var(--m-cream)" />
        <g className="cm-ear" style={origin(76, 38)}>
          <path d="M84 45 L82 24 Q81 21 78 23 L66 36 Z" fill="var(--m-gray-d)" />
          <path d="M79.5 38.5 L78.7 28.5 L71.2 35.5 Z" fill="var(--m-cream)" />
        </g>
        <ellipse cx="60" cy="54" rx="27" ry="22" fill="var(--m-gray)" />
        <ellipse cx="48" cy="38.5" rx="7" ry="3.6" fill="var(--m-sheen)" transform="rotate(-18 48 38.5)" />
        <path d="M56 33 Q60 31 64 33 L61 46 Q60 47.2 59 46 Z" fill="var(--m-gray-d)" />
        <path d="M33 54 C36 44 48 44 60 50 C72 44 84 44 87 54 C84 62 72 63 60 58 C48 63 36 62 33 54 Z" fill="var(--m-mask)" />
        <Eyes mood={mood} l={[48, 53]} r={[72, 53]} size={3.8} sclera="var(--m-white)" closedColor="var(--m-white)" browColor="var(--m-mask)" />
        <ellipse cx="60" cy="64.5" rx="12" ry="8.5" fill="var(--m-cream)" />
        <ellipse cx="60" cy="60.5" rx="3.7" ry="2.6" fill="var(--m-ink)" />
        <circle cx="58.8" cy="59.7" r="0.9" fill="var(--m-white)" />
        <Cheeks mood={mood} l={[43, 65]} r={[77, 65]} rx={3.4} ry={2} />
        <Mouth mood={mood} at={[60, 66]} w={6} />
        {mood === "think" ? (
          <g>
            <Glass x={72} y={53} />
            <circle cx="72" cy="53" r="5.6" fill="var(--m-white)" />
            <ellipse cx="73" cy="52" rx="3.6" ry="4.2" fill="var(--m-ink)" />
            <circle cx="71.6" cy="50.4" r="1.4" fill="var(--m-white)" />
          </g>
        ) : mood === "cheer" ? (
          <Glass x={89} y={49} rotate={45} />
        ) : mood === "happy" ? (
          <Glass x={33} y={84} />
        ) : mood === "comfort" ? null : (
          <Glass x={92} y={83} rotate={90} />
        )}
        <Arms
          mood={mood}
          shoulders={{ l: [42, 80], r: [78, 80] }}
          rest={{ l: [44, 95], r: [80, 95] }}
          chin={[66, 69]}
          chest={[60, 86]}
          color="var(--m-gray-d)"
          paw="var(--m-mask)"
          w={6.5}
          pose={{ idle: { r: [82, 93] }, sleepy: { r: [82, 93] }, think: { r: [82, 63] }, happy: { l: [43, 94] } }}
        />
      </Root>
      <MoodFx mood={mood} at={mood === "think" ? [26, 26] : [96, 26]} />
    </>
  );
}
