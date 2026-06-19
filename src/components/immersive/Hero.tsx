'use client';

import { useTranslations } from 'next-intl';
import { ArrowUpRight, Play, Clock, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { FadingVideo } from './FadingVideo';
import { BlurText } from './BlurText';

const AREAS = ['Kanata', 'Barrhaven', 'Orléans', 'Nepean', 'Stittsville'];

export function ImmersiveHero() {
  const t = useTranslations('Immersive');

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <FadingVideo
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top"
        style={{ width: '120%', height: '120%' }}
      />
      <div className="scrim" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-28 text-center">
          <div className="rise" style={{ animationDelay: '0.3s' }}>
            <div className="liquid-glass inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3">
              <span className="bg-gradient-ember rounded-full px-3 py-1 font-barlow text-xs font-semibold text-white">
                {t('badgeNew')}
              </span>
              <span className="font-barlow text-sm text-white tshadow">{t('badge')}</span>
            </div>
          </div>

          <BlurText
            text={t('headline')}
            accent={1}
            className="mt-5 max-w-2xl font-instrument text-6xl italic leading-[0.8] tracking-[-4px] text-white tshadow md:text-7xl lg:text-[5.5rem]"
          />

          <p
            className="rise mt-4 max-w-2xl font-barlow text-sm font-light leading-tight text-white tshadow md:text-base"
            style={{ animationDelay: '0.8s' }}
          >
            {t('subhead')}
          </p>

          <div className="rise mt-6 flex items-center gap-6" style={{ animationDelay: '1.1s' }}>
            <Link
              href="/book"
              className="bg-gradient-ember inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-barlow text-sm font-semibold text-white tshadow"
            >
              {t('ctaPrimary')} <ArrowUpRight className="size-5" />
            </Link>
            <a
              href="#services"
              className="inline-flex items-center gap-2 font-barlow text-sm font-medium text-white tshadow"
            >
              {t('ctaSecondary')} <Play className="size-4 fill-current" />
            </a>
          </div>

          <div className="rise mt-8 flex items-stretch gap-4" style={{ animationDelay: '1.3s' }}>
            {[
              { Icon: Clock, v: t('stat1Value'), l: t('stat1Label') },
              { Icon: ShieldCheck, v: t('stat2Value'), l: t('stat2Label') }
            ].map(({ Icon, v, l }) => (
              <div
                key={l}
                className="liquid-glass flex w-[220px] flex-col items-start rounded-[1.25rem] p-5 text-left"
              >
                <Icon className="size-7 text-white" />
                <div className="mt-auto pt-8">
                  <div className="font-instrument text-4xl italic leading-none tracking-[-1px] text-white tshadow">
                    {v}
                  </div>
                  <div className="mt-2 font-barlow text-xs font-light text-white">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rise flex flex-col items-center gap-4 pb-8"
          style={{ animationDelay: '1.4s' }}
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 font-barlow text-xs font-medium text-white">
            {t('trust')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-12 px-4 md:gap-16">
            {AREAS.map((n) => (
              <span
                key={n}
                className="font-instrument text-2xl italic tracking-tight text-white tshadow md:text-3xl"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
