// CONTRACT STUB — replaced by the interview prep implementation. Keep the exported names and types stable.
import type { UserSnapshot } from "@/lib/data/snapshot";

export type Recommendation = {
  id: string;
  title: string;
  /** Friendly, specific explanation of why this is recommended now. */
  message: string;
  /** Prep course module ids (routes: /prep/<moduleId>). */
  moduleIds: string[];
  /** Resource ids from the prep resource library. */
  resourceIds: string[];
  priority: number;
};

export function getRecommendations(snapshot: UserSnapshot, track: string, now: Date): Recommendation[] {
  void snapshot;
  void track;
  void now;
  return [];
}
