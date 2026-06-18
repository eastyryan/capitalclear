'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SnowflakeIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  WalletIcon
} from 'lucide-react';
import type { MoneyLocale } from '@/lib/format/money';
import { Money } from '@/components/Money';
import { DrivewayScene } from './DrivewayScene';
import { CountUp } from './CountUp';
import { useReducedMotion } from './use-reduced-motion';
import { cn } from '@/lib/utils';

// Illustrative figures (cents for money).
const WITHOUT_COST_CENTS = 78000; // $780 surprise season cost
const WITHOUT_HOURS = 32;
const WITH_COST_CENTS = 4500; // $45 / clear
const WITH_HOURS = 0;

/**
 * "Two driveways. One storm." Pinned scrollytelling that contrasts going it
 * alone (red/amber, snowed-in, mounting cost) against Capital Clear (green,
 * cleared by 7AM, predictable price). The Without/With state is driven by
 * scroll progress while pinned, and can also be toggled manually.
 *
 * Reduced motion: the section is NOT pinned. It renders as a normal block with
 * a working manual toggle; the count-ups snap to their final values.
 */
export function Compare() {
  const t = useTranslations('Landing');
  const locale = useLocale() as MoneyLocale;
  const reduced = useReducedMotion();

  const [withUs, setWithUs] = useState(false);
  // Remounts the count-ups when the side changes so they re-run.
  const [runKey, setRunKey] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  const setSide = (next: boolean) => {
    setWithUs((prev) => {
      if (prev !== next) setRunKey((k) => k + 1);
      return next;
    });
  };

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=120%',
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Flip to the "with" side past the midpoint.
          setSide(self.progress > 0.5);
        }
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden band-dark"
    >
      {/* state-tinted ambient glow */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-0 transition-opacity duration-700',
          withUs ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'radial-gradient(60% 50% at 70% 40%, rgba(52,179,106,0.15), transparent 70%)'
        }}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-0 transition-opacity duration-700',
          withUs ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          background:
            'radial-gradient(60% 50% at 30% 40%, rgba(226,58,44,0.14), transparent 70%)'
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">{t('compareEyebrow')}</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl sm:text-4xl">
            {t('compareTitle')}
          </h2>

          {/* Toggle */}
          <div
            className="mx-auto mt-7 inline-flex items-center rounded-full border border-border bg-secondary/40 p-1"
            role="tablist"
            aria-label={t('compareTitle')}
          >
            <button
              type="button"
              role="tab"
              aria-selected={!withUs}
              onClick={() => setSide(false)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                !withUs
                  ? 'bg-status-danger/20 text-[color:var(--status-danger)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('compareToggleWithout')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={withUs}
              onClick={() => setSide(true)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                withUs
                  ? 'bg-status-success/20 text-[color:var(--status-success)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('compareToggleWith')}
            </button>
          </div>
        </div>

        {/* Comparison panel */}
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
          {/* Visual */}
          <div className="relative">
            <DrivewayScene withSnow={!withUs} />
            <span
              className={cn(
                'absolute left-3 top-3 rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] backdrop-blur transition-colors',
                withUs
                  ? 'border-status-success/40 bg-status-success/15 text-[color:var(--status-success)]'
                  : 'border-status-danger/40 bg-status-danger/15 text-[color:var(--status-danger)]'
              )}
            >
              {withUs ? t('withLabel') : t('withoutLabel')}
            </span>
          </div>

          {/* Detail card */}
          <div
            className={cn(
              'rounded-2xl border bg-card p-6 transition-colors sm:p-8',
              withUs ? 'border-status-success/30' : 'border-status-danger/30'
            )}
          >
            <div className="flex items-center gap-2">
              {withUs ? (
                <CheckCircle2Icon className="size-5 text-[color:var(--status-success)]" />
              ) : (
                <XCircleIcon className="size-5 text-[color:var(--status-danger)]" />
              )}
              <h3 className="text-xl font-medium text-foreground">
                {withUs ? t('withHeadline') : t('withoutHeadline')}
              </h3>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                {withUs ? (
                  <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-[color:var(--status-success)]" />
                ) : (
                  <XCircleIcon className="mt-0.5 size-4 shrink-0 text-[color:var(--status-danger)]" />
                )}
                {withUs ? t('withPoint1') : t('withoutPoint1')}
              </li>
              <li className="flex items-start gap-2">
                {withUs ? (
                  <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-[color:var(--status-success)]" />
                ) : (
                  <XCircleIcon className="mt-0.5 size-4 shrink-0 text-[color:var(--status-danger)]" />
                )}
                {withUs ? t('withPoint2') : t('withoutPoint2')}
              </li>
            </ul>

            {/* Count-up metrics */}
            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <p className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                  <WalletIcon className="size-3.5" />
                  {withUs ? t('withCostLabel') : t('withoutCostLabel')}
                </p>
                <p
                  className={cn(
                    'mt-2 text-2xl font-medium tabular-nums sm:text-3xl',
                    withUs
                      ? 'text-[color:var(--status-success)]'
                      : 'text-[color:var(--status-danger)]'
                  )}
                >
                  <Money
                    key={`cost-${withUs}-${runKey}`}
                    cents={withUs ? WITH_COST_CENTS : WITHOUT_COST_CENTS}
                    locale={locale}
                  />
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background/40 p-4">
                <p className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                  <ClockIcon className="size-3.5" />
                  {withUs ? t('withHoursLabel') : t('withoutHoursLabel')}
                </p>
                <p
                  className={cn(
                    'mt-2 text-2xl font-medium tabular-nums sm:text-3xl',
                    withUs
                      ? 'text-[color:var(--status-success)]'
                      : 'text-[color:var(--status-danger)]'
                  )}
                >
                  <CountUp
                    key={`hrs-${withUs}-${runKey}`}
                    value={withUs ? WITH_HOURS : WITHOUT_HOURS}
                    suffix="h"
                    locale={locale}
                  />
                </p>
              </div>
            </div>

            {withUs && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--status-success)]">
                <SnowflakeIcon className="size-4" />
                {t('trustItem4')}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
