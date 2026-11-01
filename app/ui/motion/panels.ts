"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { motion } from "@/app/lib/design-system";

// Panel motion — the one way the map menu, the resort preview rail and the
// nav drawer open and close: GSAP on motion.panel's ease and duration, so
// all three move as one family. Under prefers-reduced-motion everything
// snaps (duration 0). Registered once here, at module scope.
gsap.registerPlugin(useGSAP, Flip);

export { gsap, Flip, useGSAP };

export function panelEase() {
  return motion.eases[motion.panel.ease].name;
}

export function panelDuration(seconds: number = motion.panel.duration) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduce ? 0 : seconds;
}

// An off-canvas panel on the right edge: slides in (xPercent 100 → 0) when
// `open`, out when not. A run whose `open` hasn't changed (first mount, or
// React's strict-mode re-run) snaps instead of animating, so nothing moves
// on page load; x is zeroed so a translate class used for the server
// render can't add to the offset. Closed, the panel is visibility: hidden
// once it's off-screen: nothing in it can hold focus or be tabbed to, and
// a focused control can't make an overflow-hidden ancestor scroll it back
// into view.
export function useSlideIn(ref: React.RefObject<HTMLElement | null>, open: boolean) {
  const last = useRef<boolean | null>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const to = { x: 0, xPercent: open ? 0 : 100 };
      const changed = last.current !== null && last.current !== open;
      last.current = open;
      if (!changed) {
        gsap.set(el, { ...to, visibility: open ? "visible" : "hidden" });
        return;
      }
      if (open) gsap.set(el, { visibility: "visible" });
      gsap.to(el, {
        ...to,
        duration: panelDuration(),
        ease: panelEase(),
        overwrite: true,
        onComplete: () => {
          if (!open) gsap.set(el, { visibility: "hidden" });
        },
      });
    },
    { dependencies: [open] },
  );
}

// A backdrop or scrim that fades with its panel. autoAlpha hides it
// (visibility) at 0, so a faded-out scrim never takes clicks.
export function useFade(ref: React.RefObject<HTMLElement | null>, open: boolean) {
  const last = useRef<boolean | null>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const to = { autoAlpha: open ? 1 : 0 };
      const changed = last.current !== null && last.current !== open;
      last.current = open;
      if (!changed) {
        gsap.set(el, to);
        return;
      }
      gsap.to(el, { ...to, duration: panelDuration(), ease: panelEase(), overwrite: true });
    },
    { dependencies: [open] },
  );
}
