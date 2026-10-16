// Mascot palette + motion. Rendered as a React 19 hoisted <style> (deduped by href),
// so it works from Server and Client Components without touching globals.css.
//
// Animation hooks (classes on SVG parts; only active under .cm-anim, or .cm-hov on hover):
//   cm-root   whole character: breathe (idle) / two hops then breathe (cheer) / sway (comfort)
//   cm-blink  eye group: irregular per-character blink (some double-blink)
//   cm-ear    ear/tuft: occasional twitch (set style.transformOrigin in viewBox px)
//   cm-tail   tail: swish (set transformOrigin)
//   cm-wave   arm: two waves on arrival, then a rare one (set transformOrigin at the shoulder)
//   cm-wing   moth wing: flap (set transformOrigin)
//   cm-hang   sloth body: pendulum sway from the branch
//   cm-glow   lantern light: soft pulse
//   cm-fx-*   mood effects (sparkles, thought dots, zzz, heart); cm-fxin fades them in
// Wrapper classes (on the <svg>, so they compose with the inner loops):
//   cm-enter  one 520 ms entrance hop (SpeechBubble, celebration cards, empty states)
//   cm-react  (on an inner <g> keyed by mood) a 240 ms squash when the mood changes
// Speech bubble: cm-bub (scales in from its tail), cm-bub-line, cm-bub-act (fade up after).
//
// Timing (motion spec §1/§3): each character carries its own blink period --cm-k and phase
// delays (set inline by <Mascot/>); every other loop derives from --cm-k with a different
// ratio, so no two loops on screen share a period and nothing moves in lockstep.
// Never put a `transform` attribute on an animated element (CSS would override it): wrap it in a <g>.

const EASE_AMBIENT = "cubic-bezier(.37,0,.63,1)";
const EASE_ENTER = "var(--ease-enter,cubic-bezier(.22,1,.36,1))";

const CSS = `
.cm{overflow:visible;
--m-ink:#1f2a22;--m-white:#fffdf6;--m-cream:#fbf1dc;--m-cream-2:#efdfbf;
--m-pine:#3a6a4a;--m-pine-d:#28503a;--m-sage:#9cc08a;--m-sage-d:#77a066;
--m-honey:#f2a541;--m-honey-d:#d88a26;--m-clay:#d27a50;--m-clay-d:#b05f3b;
--m-bark:#9a6a44;--m-bark-d:#6f4a2e;--m-lav:#b3a6d4;--m-lav-d:#8b7fb2;
--m-gray:#aaa6bd;--m-gray-d:#6d6886;--m-mask:#3b3850;--m-oat:#eadcc2;--m-oat-d:#d6c3a2;
--m-blush:#f39a86;--m-sky:#8fcbe4;--m-shadow:rgba(40,48,30,.16);--m-sheen:rgba(255,255,255,.2);
--cm-k:6s;--cm-db:0s;--cm-dr:0s;--cm-de:0s;--cm-dt:0s}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .cm{--m-pine:#4f8a61;--m-pine-d:#3b6e4c;--m-shadow:rgba(0,0,0,.38);--m-sheen:rgba(255,255,255,.14);--m-mask:#2e2b40}}
:root[data-theme="dark"] .cm{--m-pine:#4f8a61;--m-pine-d:#3b6e4c;--m-shadow:rgba(0,0,0,.38);--m-sheen:rgba(255,255,255,.14);--m-mask:#2e2b40}
.cm .cm-root,.cm .cm-blink,.cm .cm-fx-twinkle,.cm .cm-fx-heart,.cm .cm-react{transform-box:fill-box}
.cm .cm-ear,.cm .cm-tail,.cm .cm-wave,.cm .cm-wing,.cm .cm-hang{transform-box:view-box}
.cm .cm-root,.cm .cm-react{transform-origin:50% 100%}
.cm .cm-blink{transform-origin:50% 50%}

/* ── Idle loops ── */
.cm-anim .cm-root{animation:cm-breathe calc(var(--cm-k)*.72) ${EASE_AMBIENT} var(--cm-dr) infinite}
.cm-anim.cm-m-sleepy .cm-root{animation-duration:6.5s}
.cm-anim .cm-blink{animation:cm-blink var(--cm-k) linear var(--cm-db) infinite}
.cm-anim.cm-dbl .cm-blink{animation-name:cm-blink2}
.cm-anim .cm-ear{animation:cm-twitch calc(var(--cm-k)*1.53) ${EASE_AMBIENT} var(--cm-de) infinite}
.cm-anim .cm-tail{animation:cm-swish clamp(3.2s,calc(var(--cm-k)*.71),6s) ${EASE_AMBIENT} var(--cm-dt) infinite}
.cm-anim .cm-wing{animation:cm-flap clamp(2.2s,calc(var(--cm-k)*.43),3.6s) ${EASE_AMBIENT} var(--cm-dt) infinite}
.cm-anim .cm-hang{animation:cm-hang calc(var(--cm-k)*.83) ${EASE_AMBIENT} var(--cm-dr) infinite}
.cm-anim .cm-glow{animation:cm-glow calc(var(--cm-k)*.47) ${EASE_AMBIENT} var(--cm-de) infinite}

/* ── Moods ── */
/* Cheer: two hops, then it settles into breathing (delight is a moment, not a loop). */
.cm-anim.cm-m-cheer .cm-root{animation:cm-hop 1.5s linear .1s 2 both,cm-breathe calc(var(--cm-k)*.72) ${EASE_AMBIENT} 3.1s infinite}
.cm-anim.cm-m-cheer .cm-tail{animation:cm-swish .8s ${EASE_AMBIENT} .1s 4,cm-swish clamp(3.2s,calc(var(--cm-k)*.71),6s) ${EASE_AMBIENT} 3.3s infinite}
.cm-anim.cm-m-cheer .cm-wing{animation:cm-flap .6s ${EASE_AMBIENT} .1s 5,cm-flap clamp(2.2s,calc(var(--cm-k)*.43),3.6s) ${EASE_AMBIENT} 3.1s infinite}
.cm-anim.cm-m-comfort .cm-root{animation:cm-sway calc(var(--cm-k)*.9) ${EASE_AMBIENT} var(--cm-dr) infinite}
/* Happy: two waves hello, then an occasional one. */
.cm-anim .cm-wave{animation:cm-wave 1.3s ${EASE_AMBIENT} .35s 2,cm-wave-rare calc(var(--cm-k)*2.1) ${EASE_AMBIENT} 4s infinite}
/* Sparkles twinkle three times, then rest softly lit. */
.cm .cm-fx-twinkle{transform-origin:50% 50%;opacity:.6;transform:scale(.8)}
.cm-anim .cm-fx-twinkle{animation:cm-twinkle 1.6s ${EASE_AMBIENT} 3}
.cm-anim .cm-fx-dot{animation:cm-dots 2.4s ${EASE_AMBIENT} infinite}
.cm-anim .cm-fx-z{animation:cm-z 3.6s ease-out infinite}
.cm-anim .cm-fx-heart{transform-origin:50% 100%;animation:cm-heart 2.4s ${EASE_AMBIENT} .4s 3}
.cm-anim .cm-fxin{animation:cm-fade .2s ease-out both}

/* ── Hover-only mode (grids): still until its card is hovered or focused, then it notices you:
   a blink ~0.3 s in, an ear flick, and breathing. ── */
:is(.group:hover,.group:focus-within) .cm-hov .cm-root,.cm-hov:hover .cm-root{animation:cm-breathe calc(var(--cm-k)*.72) ${EASE_AMBIENT} infinite}
:is(.group:hover,.group:focus-within) .cm-hov .cm-blink,.cm-hov:hover .cm-blink{animation:cm-blink var(--cm-k) linear calc(.3s - var(--cm-k)*.96) infinite}
:is(.group:hover,.group:focus-within) .cm-hov .cm-ear,.cm-hov:hover .cm-ear{animation:cm-twitch calc(var(--cm-k)*1.53) ${EASE_AMBIENT} calc(.5s - var(--cm-k)*1.53*.84) infinite}

/* ── Wrappers ── */
.cm.cm-enter{transform-origin:50% 100%;animation:cm-enter .52s linear both}
.cm .cm-react{animation:cm-react .24s ease-out}

@keyframes cm-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,1.028)}}
/* ~100 ms closure: quick close, slower open. */
@keyframes cm-blink{0%,96%,100%{transform:scaleY(1)}97.4%{transform:scaleY(.08)}}
@keyframes cm-blink2{0%,90.6%,93.6%,96%,100%{transform:scaleY(1)}92%,97.4%{transform:scaleY(.08)}}
/* Anticipation squash, stretch up, ease-in fall, land squash, settle. */
@keyframes cm-hop{
0%{transform:translateY(0) scale(1,1);animation-timing-function:cubic-bezier(.33,0,.67,1)}
12%{transform:translateY(0) scale(1.06,.93);animation-timing-function:cubic-bezier(.2,.65,.35,1)}
33%{transform:translateY(-11px) scale(.97,1.04);animation-timing-function:cubic-bezier(.6,0,.8,.45)}
50%{transform:translateY(0) scale(1.05,.95);animation-timing-function:cubic-bezier(.3,1.5,.5,1)}
64%{transform:translateY(0) scale(.99,1.01);animation-timing-function:cubic-bezier(.37,0,.63,1)}
76%,100%{transform:translateY(0) scale(1,1)}}
@keyframes cm-sway{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}
@keyframes cm-twitch{0%,84%,100%{transform:rotate(0)}87%{transform:rotate(-10deg)}90%{transform:rotate(4deg)}93%{transform:rotate(-5deg)}96%{transform:rotate(0)}}
@keyframes cm-swish{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(6deg)}}
@keyframes cm-wave{0%,100%{transform:rotate(0)}30%{transform:rotate(-16deg)}65%{transform:rotate(10deg)}}
@keyframes cm-wave-rare{0%,82%,100%{transform:rotate(0)}87%{transform:rotate(-14deg)}93%{transform:rotate(8deg)}}
@keyframes cm-flap{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.84)}}
@keyframes cm-hang{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
@keyframes cm-glow{0%,100%{opacity:.5}50%{opacity:.85}}
@keyframes cm-twinkle{0%,100%{transform:scale(.8) rotate(0);opacity:.6}30%{transform:scale(.55) rotate(-8deg);opacity:.35}65%{transform:scale(1.1) rotate(18deg);opacity:1}}
@keyframes cm-dots{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes cm-z{0%{transform:translate(0,4px);opacity:0}25%{opacity:1}100%{transform:translate(7px,-12px);opacity:0}}
@keyframes cm-heart{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.08)}}
@keyframes cm-fade{from{opacity:0}to{opacity:1}}
@keyframes cm-enter{
0%{opacity:0;transform:translateY(10px) scale(.94,1.06);animation-timing-function:cubic-bezier(.2,.7,.3,1)}
55%{opacity:1;transform:translateY(-3px) scale(1.02,.98);animation-timing-function:cubic-bezier(.4,0,.6,1)}
75%{transform:translateY(0) scale(1.03,.97);animation-timing-function:cubic-bezier(.3,1.4,.5,1)}
100%{opacity:1;transform:none}}
@keyframes cm-react{0%{transform:scale(1)}35%{transform:scale(.97,1.03)}70%{transform:scale(1.03,.97)}100%{transform:scale(1)}}

/* ── Speech bubble: scales in from its tail 120 ms after the mascot, then the words fade up. ── */
.cm-bub{animation:cm-bub .36s ${EASE_ENTER} .12s both}
.cm-bub-line{animation:cm-up .28s ${EASE_ENTER} .2s both}
.cm-bub-act{animation:cm-up .28s ${EASE_ENTER} .26s both}
@keyframes cm-bub{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
@keyframes cm-up{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

@media (prefers-reduced-motion:reduce){
.cm *{animation:none!important}
.cm .cm-fx-twinkle{opacity:.8;transform:none}
.cm.cm-enter,.cm-bub,.cm-bub-line,.cm-bub-act{animation:cm-fade .2s ease-out both!important}
}
`;

export function MascotStyles() {
  return (
    <style href="canopy-mascots" precedence="medium">
      {CSS}
    </style>
  );
}
