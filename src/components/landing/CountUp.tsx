'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './use-reduced-motion';

/**
 * Animates from 0 to `value` once the element scrolls into view, via
 * IntersectionObserver. Under reduced motion (or before mount) it renders the
 * final value immediately. Uses tabular Geist Mono numerals so digits don't
 * jitter while counting.
 */
export function CountUp({
  value,
  duration = 1600,
  prefix = '',
  suffix = '',
  locale = 'en',
  className
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [counted, setCounted] = useState(0);
  const playedRef = useRef(false);

  // Reduced motion => render the final value directly (no observer, no rAF).
  // Otherwise render the animated `counted`. Deriving here keeps the effect
  // from calling setState synchronously on mount.
  const display = reduced ? value : counted;

  useEffect(() => {
    if (reduced) return;

    const el = ref.current;
    if (!el || playedRef.current) return;

    let rafId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || playedRef.current) return;
        playedRef.current = true;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCounted(Math.round(eased * value));
          if (progress < 1) rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [reduced, value, duration]);

  const formatted = new Intl.NumberFormat(locale).format(display);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
