'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon, MinusIcon, SnowflakeIcon, SparklesIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

type FaqItem = { q: string; a: string };

/**
 * FAQ accordion (controlled, single-open) followed by the final CTA band on
 * the warm red -> ember gradient. The FAQ array is read via `t.raw` since it
 * holds structured objects. No motion dependencies — works identically with
 * reduced motion (height transition is the only animation and it's harmless).
 */
export function FaqAndCta() {
  const t = useTranslations('Landing');
  const items = (t.raw('faq') as FaqItem[]) ?? [];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      {/* FAQ */}
      <section className="band-dark">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <p className="eyebrow">{t('faqEyebrow')}</p>
            <h2 className="mt-4 text-balance text-3xl sm:text-4xl">
              {t('faqTitle')}
            </h2>
          </Reveal>

          <div className="mt-10 divide-y divide-border border-y border-border">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-medium text-foreground">
                      {item.q}
                    </span>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
                      {isOpen ? (
                        <MinusIcon className="size-4" />
                      ) : (
                        <PlusIcon className="size-4" />
                      )}
                    </span>
                  </button>
                  <div
                    className={cn(
                      'grid transition-all duration-300 ease-out',
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pr-10 text-sm text-muted-foreground">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA band */}
      <section id="pricing" className="band-dark scroll-mt-24 px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="bg-gradient-ember relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-10 sm:py-20">
            {/* subtle frost texture */}
            <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,#fff_0,transparent_40%),radial-gradient(circle_at_80%_0,#fff_0,transparent_35%)]" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl text-white sm:text-4xl lg:text-5xl">
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-white/85">
                {t('ctaSubtitle')}
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/book"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-[#1a1416] shadow-lg transition-transform hover:scale-[1.02] active:scale-100"
                >
                  <SnowflakeIcon className="size-4" />
                  {t('ctaPrimary')}
                </Link>
                <Link
                  href="/register?role=pro"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/40 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <SparklesIcon className="size-4" />
                  {t('ctaSecondary')}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
