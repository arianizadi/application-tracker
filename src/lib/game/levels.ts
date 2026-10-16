export type Level = {
  index: number;
  name: string;
  minXp: number;
  /** One-line flavor text shown when previewing or reaching the level. */
  blurb: string;
  /** The small forest detail this level adds. */
  accent: string;
};

/** Eighteen cumulative forest levels. XP keeps counting after the last one. */
export const LEVELS: Level[] = [
  { index: 1, name: "Buried Acorn", minXp: 0, blurb: "Something is happening down there. Probably.", accent: "a patch of turned soil" },
  { index: 2, name: "First Root", minXp: 40, blurb: "You are officially attached to this.", accent: "a tiny root peeking out" },
  { index: 3, name: "Tiny Sprout", minXp: 100, blurb: "Two leaves. Big plans.", accent: "a first green sprout" },
  { index: 4, name: "Sunlit Seedling", minXp: 200, blurb: "Photosynthesis, but for job hunting.", accent: "a warm patch of sunlight" },
  { index: 5, name: "Fern Keeper", minXp: 350, blurb: "Fern the frog approves. Ribbit, formally.", accent: "a curl of fern fronds" },
  { index: 6, name: "Moss Tender", minXp: 550, blurb: "Soft, steady, extremely green.", accent: "a mossy stepping stone" },
  { index: 7, name: "Sapling Scout", minXp: 800, blurb: "Tall enough to see the next ridge.", accent: "a wildflower cluster" },
  { index: 8, name: "Birch Companion", minXp: 1100, blurb: "Paper-white bark. Paper-trail energy.", accent: "a slim birch tree" },
  { index: 9, name: "Woodland Walker", minXp: 1500, blurb: "You know these trails now.", accent: "a winding footpath" },
  { index: 10, name: "Grove Guardian", minXp: 2000, blurb: "A whole grove, and you planted it.", accent: "a birdhouse with a tenant" },
  { index: 11, name: "Canopy Climber", minXp: 2600, blurb: "The view from up here is mostly effort.", accent: "a rope ladder into the leaves" },
  { index: 12, name: "Cedar Steward", minXp: 3300, blurb: "Smells like persistence and pencil shavings.", accent: "a fragrant cedar" },
  { index: 13, name: "Wildwood Warden", minXp: 4100, blurb: "Even the raccoons ask you for advice.", accent: "a lantern on a post" },
  { index: 14, name: "Ancient Oak", minXp: 5000, blurb: "Rings on rings on rings.", accent: "a wide old oak" },
  { index: 15, name: "Moonlit Ranger", minXp: 6000, blurb: "Dot the moth has started a fan club.", accent: "fireflies at dusk" },
  { index: 16, name: "Evergreen Keeper", minXp: 7200, blurb: "In season, out of season, still here.", accent: "a ring of evergreens" },
  { index: 17, name: "Great Forest Friend", minXp: 8600, blurb: "Every creature knows your name.", accent: "a little pond with a heron" },
  { index: 18, name: "Keeper of the Clearing", minXp: 10000, blurb: "You grew a whole world. Take a bow.", accent: "a sunlit clearing" },
];

export function levelFor(xp: number): { level: Level; nextLevel: Level | null; levelProgress: number } {
  let i = 0;
  while (i + 1 < LEVELS.length && LEVELS[i + 1].minXp <= xp) i++;
  const level = LEVELS[i];
  const nextLevel = LEVELS[i + 1] ?? null;
  const levelProgress = nextLevel ? Math.min(1, Math.max(0, (xp - level.minXp) / (nextLevel.minXp - level.minXp))) : 1;
  return { level, nextLevel, levelProgress };
}
