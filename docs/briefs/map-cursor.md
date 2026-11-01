# Map cursor — dot with a lat · long · zoom readout

**Slug:** `map-cursor` · **Owner:** Hamish · **Opened:** 2026-11-01 · **Size:** S

## Problem
Over the map the pointer is the system arrow and hand. It tells you nothing about where you are, and the map has no coordinate readout anywhere.

## Asked for
Hamish, with a reference image: *"Create a custom mouse feature please with latitude, longitude and zoom on the appropriate sides."* The reference shows a solid round dot, `LATITUDE: 57.1220` to its left, `LONGITUDE: -4.2050` to its right and `ZOOM: 6.56` centred beneath, in condensed caps.

## Success signal
Moving over the map shows the dot in place of the system pointer, with latitude (4 dp) left, longitude (4 dp) right and zoom (2 dp) below. All three update while moving, panning, zooming and flying to a region preset. The dot hides when the pointer leaves the map (onto the sidebar, the Reset button or off the page). It grows over a pin, standing in for the pointer hand.

## In scope
- `app/ui/mapbox/MapCursor.tsx` (new) and its wiring in `app/ui/mapbox/map.tsx`.
- `mapCursor` tokens in `design-system.ts`.

## Out of scope
- Touch devices: no pointer to replace, so the cursor is hidden without `(hover: hover)`.
- Copy-to-clipboard of coordinates, or a pinned readout.

## UI note (2026-11-01)
- **Colour:** the reference dot is a pink-red that isn't in the palette, so the dot uses **rust**, the nearest brand red. The readout ink is fixed **carbon**, not `--ink`, because the basemap is light in both themes. White text in dark mode would disappear.
- **Type:** `font-ui` (Archivo Narrow) on the `text-label` rung, uppercase, `tracking-wide`, `tabular-nums` so the digits don't jitter as they change.
- **Size:** 22px dot, 10px gap to each readout. That's smaller than the reference proportion, so the dot doesn't hide the pins it points at. Over a pin it scales to 1.4× in 150 ms.
- **Resized 2026-11-01 (Hamish):** *"Decrease the size of the cursor and increase slightly on hover but the final size is still smaller than the pins."* The dot is now **8px**, growing **1.2× → 9.6px** over a pin. Pins are 10px across at their smallest (world zoom, `mapPins.radius` 5px) and up to 18px closer in, so even the grown dot never covers a pin.
- **Readout greyed 2026-11-01 (Hamish):** *"grey out the lat long and zoom slightly."* The readout ink moved from solid carbon to carbon at 60 %, the system's muted rung (the same alpha as `--ink-muted` in the light theme). The dot stays full rust.
- **Mechanics:** `map.tsx` drives the cursor imperatively (`show` / `read` / `hover` / `hide` through `useImperativeHandle`) from Mapbox's `mousemove`, `move` and `mouseout`. Moving the pointer never re-renders React. On `move` (pan, zoom, flyTo) the readout re-reads `map.unproject` at the last pointer position, so it stays true when the map moves under a still pointer. The canvas's native cursor is set to `none`; the old pin hover `cursor: pointer` became `hover(true)`.
- **Verified:** localhost:3200, dark and light. The readout reads at All of Scotland (6.50) and Cairngorms (9.00), the dot grows over a resort pin and a transport plate, and it hides over the sidebar.

- **Orbit on hover 2026-11-01 (Hamish):** *"Give the cursor a motion element on hover; add an outline that orbits the cursor like a globe / compass / sphere."* Over a pin, an 18px rust hairline globe fades in and scales up round the dot in 150 ms. It has an outline, a fixed equator, and two meridians a quarter-turn apart. Each meridian's `scaleX` runs 1 → −1 → 1, eased, over 2.4 s, which projects as a rotation about the vertical axis, so the pair read as a sphere turning. Strokes stay 1px as the meridians flatten (`vector-effect: non-scaling-stroke`). The animation is paused while the globe is hidden. Under `prefers-reduced-motion` it shows one still meridian at 0.45 and no scale. Tokens: `mapCursor.orbit`; keyframes: `.map-cursor-orbit` in `globals.css`.
- **Depth fade 2026-11-01 (Hamish):** *"create a fade to the cursor globe cursor, use three.js if necessary."* No three.js: at 18px, the depth cue that sells a sphere is the back of each line fading, and SVG can do that. Each meridian is now two half-arcs whose opacity follows how near the viewer they are (`map-cursor-depth`: 0.6 at the edge, 1 nearest, 0.2 farthest; the far half runs half a turn out of step), and the equator's far half holds at 0.3. Measured on localhost: the near and far arcs swing in opposite directions between 0.27 and 0.93 across a 2.4 s turn. The globe's own fade in and out is now 280 ms on the panel ease (`mapCursor.orbit.fadeMs`), up from a flat 150 ms. With reduced motion set, it shows one still meridian, near half full and far half at 0.3.
