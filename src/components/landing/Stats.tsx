'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from './Reveal';
import { CountUp } from './CountUp';

/**
 * Count-up stat band. Each figure animates from 0 once scrolled into view
 * (IntersectionObserver inside CountUp), rendered in tabular Geist Mono. Under
 * reduced motion the numbers render at their final value immediately.
 *
 * Numeric stat values come from the message catalog (Landing.stat*Value) so
 * they stay editable per-locale; labels carry their own unit hints.
 */
export function Stats() {
  const t = useTranslations('Landing');
  const locale = useLocale();

  const stats = [
    {
      value: Number(t('stat1Value')),
      label: t('stat1Label'),
      suffix: '+'
    },
    { value: Number(t('stat2Value')), label: t('stat2Label'), suffix: 'AM' },
    { value: Number(t('stat3Value')), label: t('stat3Label'), suffix: '%' },
    { value: Number(t('stat4Value')), label: t('stat4Label'), suffix: '+' }
  ];

  return (
    <section className="band-dark border-y border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <p className="eyebrow">{t('statsEyebrow')}</p>
          <h2 className="mt-4 max-w-2xl text-balance text-3xl sm:text-4xl">
            {t('statsTitle')}
          </h2>
        </Reveal>

        <dl className="mt-14 grid grid-cols-2 gap-y-10 gap-x-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <p className="font-mono text-4xl font-normal tabular-nums tracking-tight text-foreground sm:text-5xl">
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    locale={locale}
                  />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                <span className="mt-3 block h-px w-10 bg-gradient-ember" />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
