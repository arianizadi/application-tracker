import { Cheeks, Eyes, Ground, MoodFx, Mouth, Root, origin, type CharacterProps, type P } from "../parts";

function Claws({ at }: { at: P }) {
  const [x, y] = at;
  return (
    <path
      d={`M${x - 3} ${y - 2} l-0.8 -3.2 M${x} ${y - 2.6} l0 -3.4 M${x + 3} ${y - 2} l0.8 -3.2`}
      stroke="var(--m-cream)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  );
}

/** Moss the sloth — guardian of breaks. Hangs from a branch; raises a BRB sign when sleepy. */
export function Moss({ mood }: CharacterProps) {
  const rightArm: Record<typeof mood, { d: string; paw: P; claws: boolean; wave?: boolean }> = {
    idle: { d: "M74 54 Q83 38 78 22", paw: [78, 22], claws: true },
    sleepy: { d: "M74 54 Q83 38 78 22", paw: [78, 22], claws: true },
    happy: { d: "M75 56 Q86 50 92 38", paw: [92, 38], claws: false, wave: true },
    cheer: { d: "M75 56 Q90 44 95 28", paw: [95, 28], claws: false, wave: true },
    think: { d: "M75 58 Q84 72 67 75", paw: [67, 75], claws: false },
    comfort: { d: "M75 58 Q80 76 63 82", paw: [63, 82], claws: false },
  };
  const arm = rightArm[mood];
  return (
    <>
      <Ground cy={112} rx={20} />
      <path d="M4 23 Q60 13 116 25" stroke="var(--m-bark)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M16 19 q5 -12 16 -8.5 q-4.5 10 -16 8.5 Z" fill="var(--m-sage-d)" />
      <path d="M95 22 q8 -10.5 17 -4.5 q-6.5 8.5 -17 4.5 Z" fill="var(--m-sage)" />
      {mood === "sleepy" ? (
        <g>
          <path d="M91 25 L89 36 M103 26 L105 36" stroke="var(--m-bark-d)" strokeWidth="1.2" />
          <rect x="84" y="35" width="26" height="13" rx="3" fill="var(--m-bark)" />
          <text x="97" y="44.6" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--m-cream)" fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing="0.5">
            BRB
          </text>
        </g>
      ) : null}
      <g className="cm-hang" style={origin(60, 20)}>
        <Root>
          <path d="M46 54 Q37 38 42 22" stroke="var(--m-sage-d)" strokeWidth="9" strokeLinecap="round" fill="none" />
          <Claws at={[42, 22]} />
          <ellipse cx="60" cy="74" rx="25" ry="30" fill="var(--m-sage)" />
          <ellipse cx="51" cy="56" rx="7" ry="4" fill="var(--m-sheen)" transform="rotate(-30 51 56)" />
          <ellipse cx="60" cy="86" rx="15" ry="16" fill="var(--m-oat)" />
          <g fill="var(--m-sage-d)">
            <ellipse cx="50" cy="103" rx="6" ry="3.6" />
            <ellipse cx="70" cy="103" rx="6" ry="3.6" />
          </g>
          <ellipse cx="60" cy="62.5" rx="18.5" ry="14.5" fill="var(--m-cream)" />
          <ellipse cx="51.5" cy="62" rx="7.2" ry="4.6" transform="rotate(-16 51.5 62)" fill="var(--m-bark)" />
          <ellipse cx="68.5" cy="62" rx="7.2" ry="4.6" transform="rotate(16 68.5 62)" fill="var(--m-bark)" />
          <Eyes mood={mood} l={[51.5, 62]} r={[68.5, 62]} size={3.5} closedColor="var(--m-cream)" brows={false} />
          <ellipse cx="60" cy="68" rx="3.4" ry="2.4" fill="var(--m-clay-d)" />
          <Cheeks mood={mood} l={[46.5, 70]} r={[73.5, 70]} rx={3} ry={1.8} />
          <Mouth mood={mood} at={[60, 72]} w={6} />
          <g className={arm.wave ? "cm-wave" : undefined} style={arm.wave ? origin(75, 56) : undefined}>
            <path d={arm.d} stroke="var(--m-sage-d)" strokeWidth="9" strokeLinecap="round" fill="none" />
            {arm.claws ? <Claws at={arm.paw} /> : null}
          </g>
        </Root>
      </g>
      <MoodFx mood={mood} at={mood === "sleepy" ? [24, 44] : [100, 50]} />
    </>
  );
}
