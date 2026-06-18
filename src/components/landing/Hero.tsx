'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Snowflake, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { DrivewayScene, DrivewaySnow } from './DrivewayScene';
import { useReducedMotion } from './use-reduced-motion';

/**
 * Pinned hero. As the user scrolls through ~1.6 viewports the snow overlay on
 * the driveway is wiped away (clip-path inset from 0% -> 100% on the bottom),
 * revealing clean asphalt — the literal product promise.
 *
 * Reduced motion: nothing is pinned or scrubbed. The snow layer is shown at a
 * fixed 55% wipe so both states (snow-covered + cleared) read in one static
 * frame, and a "before / after" caption replaces the scroll hint.
 */
export function Hero() {
  const t = useTranslations('Landing');
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const snowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const snow = snowRef.current;
    const section = sectionRef.current;
    if (!snow || !section) return;

    if (reduced) {
      // Static split: keep ~half the driveway under snow.
      snow.style.clipPath = 'inset(0 0 45% 0)';
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Start fully snow-covered.
      gsap.set(snow, { clipPath: 'inset(0% 0% 0% 0%)' });

      gsap.to(snow, {
        clipPath: 'inset(0% 0% 100% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1
        }
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12">
        {/* Copy */}
        <div className="relative z-10 max-w-xl">
          <p className="eyebrow mb-5 inline-flex items-center gap-2">
            <Snowflake className="size-3.5 text-primary" />
            {t('heroEyebrow')}
          </p>
          <h1 className="text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
            {t('heroSubtitle')}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="bg-gradient-ember inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium text-primary-foreground shadow-[0_12px_32px_-10px_rgba(226,58,44,0.7)] transition-transform hover:scale-[1.02] active:scale-100"
            >
              <Snowflake className="size-4" />
              {t('heroCtaPrimary')}
            </Link>
            <Link
              href="/register?role=pro"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Sparkles className="size-4 text-ember" />
              {t('heroCtaSecondary')}
            </Link>
          </div>

          {/* Scroll hint / static caption */}
          {reduced ? (
            <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t('heroBadgeBefore')} → {t('heroBadgeAfter')}
            </p>
          ) : (
            <p className="mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <ArrowDown className="size-3.5 animate-bounce" />
              {t('heroScrollHint')}
            </p>
          )}
        </div>

        {/* Driveway visual */}
        <div className="relative">
          <div className="relative">
            {/* Cleared asphalt base. */}
            <DrivewayScene />
            {/* Snow overlay, clipped away on scroll to reveal the base. */}
            <div
              ref={snowRef}
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            >
              <DrivewaySnow />
            </div>

            {/* State badges */}
            <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white/90 backdrop-blur">
              {t('heroBadgeBefore')}
            </span>
            <span className="absolute bottom-3 right-3 rounded-full border border-status-success/40 bg-status-success/15 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-status-success backdrop-blur">
              {t('heroBadgeAfter')}
            </span>
          </div>

          {/* ambient glow */}
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_30%,rgba(226,58,44,0.18),transparent_70%)] blur-2xl" />
        </div>
      </div>
    </section>
  );
}
