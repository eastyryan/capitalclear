'use client';

import { useTranslations } from 'next-intl';
import {
  CameraIcon,
  ShieldCheckIcon,
  BadgeCheckIcon,
  ClockIcon,
  CalendarPlusIcon,
  TruckIcon,
  CheckCircle2Icon
} from 'lucide-react';
import { Reveal } from './Reveal';

/**
 * Trust strip + "How it works" three-step explainer. Pure scroll-reveal — no
 * pin/scrub — so it degrades to plain static content under reduced motion (the
 * Reveal wrapper shows everything immediately in that case).
 */
export function TrustAndHow() {
  const t = useTranslations('Landing');

  const trust = [
    { icon: CameraIcon, label: t('trustItem1') },
    { icon: ShieldCheckIcon, label: t('trustItem2') },
    { icon: BadgeCheckIcon, label: t('trustItem3') },
    { icon: ClockIcon, label: t('trustItem4') }
  ];

  const steps = [
    { icon: CalendarPlusIcon, title: t('step1Title'), body: t('step1Body') },
    { icon: TruckIcon, title: t('step2Title'), body: t('step2Body') },
    { icon: CheckCircle2Icon, title: t('step3Title'), body: t('step3Body') }
  ];

  return (
    <>
      {/* Trust strip */}
      <section className="border-y border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {trust.map((item, i) => (
              <Reveal as="li" key={item.label} delay={i * 80}>
                <div className="flex items-center gap-2.5">
                  <item.icon className="size-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground/90">{item.label}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="band-dark scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <p className="eyebrow">{t('howEyebrow')}</p>
            <h2 className="mt-4 max-w-2xl text-balance text-3xl sm:text-4xl">
              {t('howTitle')}
            </h2>
          </Reveal>

          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 120}>
                <div className="group relative h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-ember text-primary-foreground">
                      <step.icon className="size-5" />
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
