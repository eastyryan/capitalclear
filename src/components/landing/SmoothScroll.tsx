'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './use-reduced-motion';

/**
 * Mounts a single Lenis smooth-scroll instance and wires it into GSAP
 * ScrollTrigger so pinned/scrubbed sections stay in sync. Under reduced motion
 * it does nothing — native scrolling is used and no ScrollTriggers run.
 *
 * Section components register their own ScrollTriggers; this provider just owns
 * the scroll engine + the rAF loop driving it.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // Anchor links should still jump via Lenis for a consistent feel.
      anchors: true
    });

    // Keep ScrollTrigger in lockstep with Lenis.
    lenis.on('scroll', ScrollTrigger.update);

    const onRaf = (time: number) => {
      // Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    // Give late-mounting triggers a chance to measure correctly.
    const refresh = () => ScrollTrigger.refresh();
    const refreshId = window.setTimeout(refresh, 200);
    window.addEventListener('load', refresh);

    return () => {
      window.clearTimeout(refreshId);
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reduced]);

  return <>{children}</>;
}
