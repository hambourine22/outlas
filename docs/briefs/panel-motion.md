# Panel motion — toolbars and sidebars on GSAP

**Slug:** `panel-motion` · **Owner:** Hamish · **Opened:** 2026-11-01 · **Size:** S

## Asked for
*"Create a smooth scroll with GSAP and add to motion tokens ease in out quart or quint please and test for timings"*, then *"Specifically for the expansion of the toolbars and sidebars."*

## What moves
| Surface | Before | Now |
|---|---|---|
| Map Symbols, pill ⇄ panel | instant swap of two renders | GSAP **Flip**: one 20px-cornered shape resizes 40 × 121 ⇄ 288 × ~800 (`scale: false`, so the corners stay round); contents fade in over the last 0.25 s |
| Resort preview rail | CSS slide, 200 ms ease-out | GSAP `xPercent` slide; backdrop fades with it |
| Nav drawer (hamburger) | CSS slide, 200 ms ease-out | GSAP `xPercent` slide; scrim fades with it |

All three share `app/ui/motion/panels.ts` (`useSlideIn`, `useFade`, `panelEase`, `panelDuration`). Under `prefers-reduced-motion` the duration is 0, so the panels snap.

## Tokens (`motion` in `design-system.ts`)
- `motion.eases.inOutQuart`: `power3.inOut` · `cubic-bezier(0.76, 0, 0.24, 1)`
- `motion.eases.inOutQuint`: `power4.inOut` · `cubic-bezier(0.83, 0, 0.17, 1)`
- `motion.panel`: `{ ease: "inOutQuart", duration: 0.45, fadeIn: 0.25 }`. To try quint, change one word.

GSAP counts powers from 1 = quad, so quart is `power3` and quint is `power4`.

## Timings, measured (localhost, 120 Hz display, 2026-11-01)
Each run sampled the element every animation frame, then compared normalised progress against the quart formula.

| Surface | Travel | Visible motion | Frames | Worst frame gap | Max deviation from quart |
|---|---|---|---|---|---|
| Map menu collapse | 288 × 797 → 40 × 121 | 417 ms | 50 | 9 ms | 2.2 % |
| Map menu expand | 40 × 121 → 288 × 797 | 408–426 ms | 49–51 | 9 ms | 2.4 % |
| Nav drawer open | 288 px | 434 ms | 52 | 9 ms | 1.9 % |
| Nav drawer close | 288 px | 442 ms | 53 | 9 ms | 1.0 % |
| Preview rail open | 448 px | 442 ms | 53 | 9 ms | 0.6 % |

"Visible motion" is a little under the 450 ms tween because quart moves less than a hundredth of a pixel in its first and last frames. No dropped frames. Scrims and backdrops fade over the same tween, with about 350 ms visible.

Why quart at 0.45 s: quart peaks at 4× the average speed mid-tween and quint at 5×. Over the rail's 448 px in 0.45 s, that's about 4,000 px/s versus 5,000 px/s. Quart keeps the middle readable at this duration. Quint suits a longer duration (around 0.55 s) if the panels should feel more decisive.

## Fixed in passing
- The map wrapper was `overflow-hidden`. Focus left on the closed rail's Close button let the browser scroll that box 448 px sideways, dragging the hidden rail into view. It's now `overflow-clip`, and a closed panel is `visibility: hidden` once its slide-out ends, so nothing off-screen can hold focus or be tabbed to.
- The rail's mobile backdrop used `bg-ink/40`, which compiles to no CSS. It's now `bg-[var(--scrim)]`.

## Not done
- The collapsible groups inside the panels (Providers, Transport, nav groups) still open instantly. That's an XS follow-up on the same helper if wanted.
