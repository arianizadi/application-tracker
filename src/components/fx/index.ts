// Canopy celebration effects. All client-side; import from Client Components.
export {
  CelebrateOnMount,
  CelebrationProvider,
  useCelebrate,
  type CelebrateApi,
  type CelebrateOptions,
  type CelebrationKind,
} from "./celebrate";
export { FireflyBurst, LeafConfetti, fireflyBurst, leafConfetti } from "./bursts";
export { MotionGate } from "./motion-gate";
export { RainThenRainbow } from "./rain-rainbow";
export { SeedPop } from "./seed-pop";
export {
  getCelebrationIntensity,
  prefersReducedMotion,
  setCelebrationIntensity,
  useCelebrationIntensity,
  useReducedMotion,
  type CelebrationIntensity,
} from "./motion";
export { currentSeason, seasonalPalette, type LeafPalette, type Origin, type Season } from "./particles";
