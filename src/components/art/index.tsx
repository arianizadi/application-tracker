/**
 * Small, server-rendered illustrations and entrance wrappers for empty states.
 *
 *   <EmptyState art={<FirstPlanting title="…" />} … />
 *   <ArtFade>{supporting preview}</ArtFade>   (mascots: use <Mascot enter />)
 */
import type { CSSProperties, ReactNode } from "react";

import styles from "./art.module.css";

export { FirstPlanting, PlantingBed } from "./planting-bed";

/** Quiet 300 ms fade for a supporting illustration or preview. */
export function ArtFade({ children, delay = 120, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`${styles.fadeIn} ${className}`} style={{ "--fade-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}
