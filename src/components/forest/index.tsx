// CONTRACT STUB — replaced by the forest implementation. Keep these exports and prop types stable.
import type { ForestState } from "@/lib/forest/derive";

export function Forest({ state, className = "" }: { state: ForestState; className?: string; interactive?: boolean }) {
  return (
    <svg viewBox="0 0 1200 500" className={className} role="img" aria-label={`Your forest with ${state.trees.length} trees`}>
      <rect width="1200" height="500" fill="var(--sky-soft)" />
      <rect y="380" width="1200" height="120" fill="var(--moss-soft)" />
    </svg>
  );
}
