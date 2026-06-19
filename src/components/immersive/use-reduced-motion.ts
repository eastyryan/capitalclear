'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe prefers-reduced-motion hook. Returns false until mounted (so the
 * server and first client paint agree), then reflects the live media query.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}
