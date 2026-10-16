/**
 * Chart entrance animations. CSS-only (no JS), transform/opacity only, and
 * fully disabled under prefers-reduced-motion. React hoists and dedupes this
 * <style> by `href`, so any number of charts can render it.
 */
const css = `
@keyframes stats-grow-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes stats-grow-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes stats-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes stats-sprout { from { transform: scale(0.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.stats-grow-y { transform-origin: 50% 100%; animation: stats-grow-y 700ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 40ms); }
.stats-grow-x { transform-origin: 0 50%; animation: stats-grow-x 800ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 70ms); }
.stats-draw { stroke-dasharray: 1; stroke-dashoffset: 0; animation: stats-draw 1100ms cubic-bezier(.22,1,.36,1) both; }
.stats-sprout { transform-box: fill-box; transform-origin: center; animation: stats-sprout 500ms cubic-bezier(.34,1.56,.64,1) both; animation-delay: calc(var(--i, 0) * 4ms); }
@media (prefers-reduced-motion: reduce) {
  .stats-grow-y, .stats-grow-x, .stats-draw, .stats-sprout { animation: none !important; }
}
`;

export function StatsMotion() {
  return (
    <style href="canopy-stats-motion" precedence="default">
      {css}
    </style>
  );
}
