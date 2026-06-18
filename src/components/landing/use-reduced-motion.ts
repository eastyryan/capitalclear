'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks the user's `prefers-reduced-motion` setting.
 *
 * Returns `true` when motion should be suppressed. SSR-safe: starts `true`
 * (the conservative, motion-off default) and resolves on mount, so the server
 * render and first client paint never trigger animation. Updates live if the
 * OS setting changes.
 */
export function useReducedMotion(): boolean {
  // Default to reduced (no motion) until we can read the media query on the
  // client. This guarantees we never flash an animation before knowing intent.
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Sync from the media query (initial value + live changes) through a single
    // callback, comparing against the current value so we only update on a real
    // change rather than firing setState unconditionally on mount.
    const sync = (matches: boolean) =>
      setReduced((prev) => (prev === matches ? prev : matches));

    sync(query.matches);
    const onChange = (event: MediaQueryListEvent) => sync(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
