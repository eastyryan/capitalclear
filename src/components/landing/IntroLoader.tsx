'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Snowflake } from 'lucide-react';
import { useReducedMotion } from './use-reduced-motion';

const SESSION_KEY = 'cc_intro_seen';

/**
 * Full-screen intro loader: a Geist Mono 0 -> 100% counter that wipes up to
 * reveal the page. Runs at most once per browser session (sessionStorage) and
 * is skipped entirely under prefers-reduced-motion. Locks body scroll only
 * while visible.
 */
export function IntroLoader() {
  const t = useTranslations('Landing');
  const reduced = useReducedMotion();

  // Starts 'pending' (renders nothing — matches SSR). The decision to run or
  // skip is made on the next animation frame so we never call setState
  // synchronously inside the effect body.
  const [phase, setPhase] = useState<'pending' | 'running' | 'wiping' | 'done'>(
    'pending'
  );
  const [pct, setPct] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let rafId = 0;
    const start = performance.now();
    const duration = 1500;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Ease-out so the counter decelerates toward 100.
      const eased = 1 - Math.pow(1 - progress, 3);
      setPct(Math.round(eased * 100));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setPhase('wiping');
      }
    };

    // Defer the show/skip decision to a frame so the first state update is
    // asynchronous (no cascading render on mount).
    rafId = requestAnimationFrame(() => {
      const seen = window.sessionStorage.getItem(SESSION_KEY) === '1';
      if (reduced || seen) {
        setPhase('done');
        return;
      }
      setPhase('running');
      document.body.style.overflow = 'hidden';
      rafId = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(rafId);
  }, [reduced]);

  // Handle the wipe -> done transition + restore scroll.
  useEffect(() => {
    if (phase !== 'wiping') return;
    const id = window.setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = '';
      window.sessionStorage.setItem(SESSION_KEY, '1');
    }, 700);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Safety: always restore scroll on unmount.
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 'pending' = decision not yet made (avoids a flash before we know whether to
  // show the loader); 'done' = finished or skipped.
  if (phase === 'pending' || phase === 'done') return null;

  const wiping = phase === 'wiping';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
      style={{ transform: wiping ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      <div className="flex flex-col items-center gap-6">
        <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-ember">
          <Snowflake className="size-6 text-primary-foreground" />
        </span>
        <p className="eyebrow">{t('loaderText')}</p>
        <p className="font-mono text-6xl font-normal tabular-nums tracking-tight text-foreground sm:text-7xl">
          {pct}
          <span className="text-primary">%</span>
        </p>
      </div>

      {/* Progress hairline */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-border">
        <div
          className="h-full bg-gradient-ember transition-[width] duration-100 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
