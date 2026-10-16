// Mascot palette + idle animations. Rendered as a React 19 hoisted <style> (deduped by href),
// so it works from Server and Client Components without touching globals.css.
//
// Animation hooks (classes on SVG parts; only active under .cm-anim):
//   cm-root   whole character: breathe (idle) / hop (cheer) / sway (comfort) / slow (sleepy)
//   cm-blink  eye group: periodic blink
//   cm-ear    ear/tuft: occasional twitch (set style.transformOrigin in viewBox px)
//   cm-tail   tail: swish (set transformOrigin)
//   cm-wave   arm: wave (set transformOrigin at the shoulder)
//   cm-wing   moth wing: flap (set transformOrigin)
//   cm-hang   sloth body: pendulum sway from the branch
//   cm-glow   lantern light: soft pulse
//   cm-fx-*   mood effects (sparkles, thought dots, zzz, heart)
// Never put a `transform` attribute on an animated element (CSS would override it): wrap it in a <g>.

const CSS = `
.cm{overflow:visible;
--m-ink:#1f2a22;--m-white:#fffdf6;--m-cream:#fbf1dc;--m-cream-2:#efdfbf;
--m-pine:#3a6a4a;--m-pine-d:#28503a;--m-sage:#9cc08a;--m-sage-d:#77a066;
--m-honey:#f2a541;--m-honey-d:#d88a26;--m-clay:#d27a50;--m-clay-d:#b05f3b;
--m-bark:#9a6a44;--m-bark-d:#6f4a2e;--m-lav:#b3a6d4;--m-lav-d:#8b7fb2;
--m-gray:#aaa6bd;--m-gray-d:#6d6886;--m-mask:#3b3850;--m-oat:#eadcc2;--m-oat-d:#d6c3a2;
--m-blush:#f39a86;--m-sky:#8fcbe4;--m-shadow:rgba(40,48,30,.16);--m-sheen:rgba(255,255,255,.2)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .cm{--m-pine:#4f8a61;--m-pine-d:#3b6e4c;--m-shadow:rgba(0,0,0,.38);--m-sheen:rgba(255,255,255,.14);--m-mask:#2e2b40}}
:root[data-theme="dark"] .cm{--m-pine:#4f8a61;--m-pine-d:#3b6e4c;--m-shadow:rgba(0,0,0,.38);--m-sheen:rgba(255,255,255,.14);--m-mask:#2e2b40}
.cm .cm-root,.cm .cm-blink,.cm .cm-fx-twinkle,.cm .cm-fx-heart{transform-box:fill-box}
.cm .cm-ear,.cm .cm-tail,.cm .cm-wave,.cm .cm-wing,.cm .cm-hang{transform-box:view-box}
.cm .cm-root{transform-origin:50% 100%}
.cm .cm-blink{transform-origin:50% 50%}
.cm-anim .cm-root{animation:cm-breathe 4.6s ease-in-out var(--cm-d,0s) infinite}
.cm-anim.cm-m-cheer .cm-root{animation:cm-hop 1.5s cubic-bezier(.3,.7,.4,1) var(--cm-d,0s) infinite}
.cm-anim.cm-m-comfort .cm-root{animation:cm-sway 5.5s ease-in-out var(--cm-d,0s) infinite;transform-origin:50% 100%}
.cm-anim.cm-m-sleepy .cm-root{animation-duration:6.5s}
.cm-anim .cm-blink{animation:cm-blink 5.2s ease-in-out var(--cm-d,0s) infinite}
.cm-anim .cm-ear{animation:cm-twitch 7s ease-in-out var(--cm-d,0s) infinite}
.cm-anim .cm-tail{animation:cm-swish 3.8s ease-in-out var(--cm-d,0s) infinite}
.cm-anim.cm-m-cheer .cm-tail{animation-duration:1.1s}
.cm-anim .cm-wave{animation:cm-wave 1.4s ease-in-out infinite}
.cm-anim .cm-wing{animation:cm-flap 2.6s ease-in-out var(--cm-d,0s) infinite}
.cm-anim.cm-m-cheer .cm-wing{animation-duration:.7s}
.cm-anim .cm-hang{animation:cm-hang 6s ease-in-out var(--cm-d,0s) infinite}
.cm-anim .cm-glow{animation:cm-glow 3.2s ease-in-out infinite}
.cm-anim .cm-fx-twinkle{transform-origin:50% 50%;animation:cm-twinkle 1.6s ease-in-out infinite}
.cm-anim .cm-fx-dot{animation:cm-dots 1.8s ease-in-out infinite}
.cm-anim .cm-fx-z{animation:cm-z 3s ease-out infinite}
.cm-anim .cm-fx-heart{transform-origin:50% 100%;animation:cm-heart 2.4s ease-in-out infinite}
@keyframes cm-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,1.028)}}
@keyframes cm-hop{0%,55%,100%{transform:translateY(0) scale(1,1)}8%{transform:translateY(0) scale(1.05,.94)}22%{transform:translateY(-8px) scale(.97,1.04)}36%{transform:translateY(0) scale(1.04,.96)}46%{transform:translateY(-2px)}}
@keyframes cm-sway{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}
@keyframes cm-blink{0%,93%,100%{transform:scaleY(1)}95.5%{transform:scaleY(.1)}}
@keyframes cm-twitch{0%,84%,100%{transform:rotate(0)}87%{transform:rotate(-10deg)}90%{transform:rotate(4deg)}93%{transform:rotate(-5deg)}96%{transform:rotate(0)}}
@keyframes cm-swish{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(6deg)}}
@keyframes cm-wave{0%,100%{transform:rotate(0)}30%{transform:rotate(-16deg)}65%{transform:rotate(10deg)}}
@keyframes cm-flap{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.84)}}
@keyframes cm-hang{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
@keyframes cm-glow{0%,100%{opacity:.5}50%{opacity:.85}}
@keyframes cm-twinkle{0%,100%{transform:scale(.55) rotate(0);opacity:.35}50%{transform:scale(1.1) rotate(20deg);opacity:1}}
@keyframes cm-dots{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes cm-z{0%{transform:translate(0,4px);opacity:0}25%{opacity:1}100%{transform:translate(7px,-12px);opacity:0}}
@keyframes cm-heart{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.08)}}
@media (prefers-reduced-motion:reduce){.cm *{animation:none!important}}
`;

export function MascotStyles() {
  return (
    <style href="canopy-mascots" precedence="medium">
      {CSS}
    </style>
  );
}
