'use client';

import { useTranslations } from 'next-intl';
import { Snowflake, Scissors, Leaf, type LucideIcon } from 'lucide-react';
import { FadingVideo } from './FadingVideo';

export function ImmersiveServices() {
  const t = useTranslations('Immersive');

  const cards: { Icon: LucideIcon; title: string; tags: string[]; body: string }[] = [
    { Icon: Snowflake, title: t('snowTitle'), tags: t.raw('snowTags') as string[], body: t('snowBody') },
    { Icon: Scissors, title: t('lawnTitle'), tags: t.raw('lawnTags') as string[], body: t('lawnBody') },
    {
      Icon: Leaf,
      title: t('seasonalTitle'),
      tags: t.raw('seasonalTags') as string[],
      body: t('seasonalBody')
    }
  ];

  return (
    <section id="services" className="relative min-h-screen w-full overflow-hidden bg-black">
      <FadingVideo src="/services.mp4" className="absolute inset-0 z-0 h-full w-full object-cover" />
      <div className="scrim" />

      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-10 pt-28 md:px-16 lg:px-20">
        <div className="mb-auto">
          <div className="mb-6 font-barlow text-sm text-white/80 tshadow">// {t('servicesKicker')}</div>
          <h2 className="font-instrument text-6xl italic leading-[0.9] tracking-[-3px] text-white tshadow md:text-7xl lg:text-[6rem]">
            {t('servicesHeadA')}
            <br />
            <span className="text-ember">{t('servicesHeadB')}</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className="liquid-glass flex min-h-[360px] flex-col rounded-[1.25rem] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="liquid-glass flex size-11 items-center justify-center rounded-[0.75rem]">
                  <c.Icon className="size-6 text-white" />
                </div>
                <div className="flex max-w-[70%] flex-wrap justify-end gap-1.5">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 font-barlow text-[11px] text-white/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <div className="mt-6">
                <h3 className="font-instrument text-3xl italic leading-none tracking-[-1px] text-white md:text-4xl">
                  {c.title}
                </h3>
                <p className="mt-3 max-w-[32ch] font-barlow text-sm font-light leading-snug text-white/90">
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
