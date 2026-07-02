'use client';

import { useTranslations } from 'next-intl';
import { SnowflakeIcon, ScissorsIcon, LeafIcon, ArrowRightIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Reveal } from './Reveal';

/**
 * Services grid (snow / lawn / seasonal). Rendered on the light contrast band
 * to break up the cinematic dark sections. Each card carries the snow-clear
 * motif via an accent bar and season tag. Anchor target #services.
 */
export function Services() {
  const t = useTranslations('Landing');

  const services = [
    {
      icon: SnowflakeIcon,
      title: t('serviceSnowTitle'),
      body: t('serviceSnowBody'),
      tag: t('serviceSnowTag'),
      accent: 'var(--ice)'
    },
    {
      icon: ScissorsIcon,
      title: t('serviceLawnTitle'),
      body: t('serviceLawnBody'),
      tag: t('serviceLawnTag'),
      accent: 'var(--status-success)'
    },
    {
      icon: LeafIcon,
      title: t('serviceSeasonalTitle'),
      body: t('serviceSeasonalBody'),
      tag: t('serviceSeasonalTag'),
      accent: 'var(--ember)'
    }
  ];

  return (
    <section id="services" className="band-light scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <p className="eyebrow">{t('servicesEyebrow')}</p>
          <h2 className="mt-4 max-w-2xl text-balance text-3xl tracking-tight sm:text-4xl">
            {t('servicesTitle')}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 110}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
                {/* accent bar */}
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: service.accent }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className="flex size-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${service.accent} 16%, white)`,
                      color: service.accent
                    }}
                  >
                    <service.icon className="size-5" />
                  </span>
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-black/40">
                    {service.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-medium text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-black/60">{service.body}</p>
                <Link
                  href="/book"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-[color:var(--primary-hover)]"
                >
                  {t('heroCtaPrimary')}
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
