import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Footer } from '@/components/site/Footer';
import {
  PageHero,
  Section,
  SectionHeading,
  CtaBand,
  PrimaryCta,
  Feature
} from '@/components/marketing/parts';

// Three per-visit tiers. Walkway is an add-on (price shown with a leading +).
const TIERS: { key: 'single' | 'double' | 'walkway'; cents: number; icon: string; featured?: boolean; addon?: boolean }[] = [
  { key: 'single', cents: 4500, icon: 'shovel' },
  { key: 'double', cents: 5500, icon: 'snowflake', featured: true },
  { key: 'walkway', cents: 2500, icon: 'salt', addon: true }
];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PricingPage' });
  return { title: `${t('metaTitle')} · Capital Clear` };
}

export default async function PricingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'PricingPage' });

  const money = new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0
  });

  const premium = t.raw('premium') as { title: string; body: string }[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('accent')}
        subtitle={t('subtitle')}
      />

      {/* Three per-visit tiers — radio-card look. */}
      <Section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIERS.map(({ key, cents, icon, featured, addon }) => {
            const features = t.raw(`tiers.${key}.features`) as string[];
            const priceText = `${addon ? '+' : ''}${money.format(cents / 100)}`;
            return (
              <div
                key={key}
                className={`flex flex-col rounded-lg border p-6 transition-colors duration-150 motion-reduce:transition-none ${
                  featured
                    ? 'border-[var(--cc-accent)] bg-[var(--cc-tint)]'
                    : 'border-[var(--cc-line)] hover:border-[var(--cc-ink-soft)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span aria-hidden="true" className={`cc-icon cc-icon--${icon} h-12 w-12`} />
                  {featured ? (
                    <span className="rounded-full bg-[var(--cc-accent)] px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-[var(--cc-accent-ink)]">
                      {t('popular')}
                    </span>
                  ) : addon ? (
                    <span className="rounded-full border border-[var(--cc-line)] px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
                      {t('addOn')}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tighter text-[var(--cc-ink)]">
                  {t(`tiers.${key}.name`)}
                </h3>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl tracking-tighter text-[var(--cc-ink)]">
                    {priceText}
                  </span>
                  <span className="font-mono text-xs text-[var(--cc-ink-soft)]">
                    {t('perVisit')}
                  </span>
                </div>

                <ul className="mt-6 flex-1 space-y-3 border-t border-[var(--cc-line)] pt-5">
                  {features.map((f) => (
                    <Feature key={f}>{f}</Feature>
                  ))}
                </ul>

                <div className="mt-8">
                  <PrimaryCta href="/book">{t('cta')}</PrimaryCta>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 font-mono text-[11px] text-[var(--cc-ink-soft)]">{t('payNote')}</p>
      </Section>

      {/* Priority Premium (consumer) */}
      <Section>
        <SectionHeading
          eyebrow={t('premiumKicker')}
          title={t('premiumTitle')}
          accent={t('premiumAccent')}
          subtitle={t('premiumSubtitle')}
        />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {premium.map((p, i) => (
            <div
              key={p.title}
              className="flex flex-col rounded-xl bg-[var(--cc-tint)] p-6"
            >
              <span className="font-mono text-xs text-[var(--cc-accent)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tighter text-[var(--cc-ink)]">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--cc-ink-soft)]">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        title={t('ctaTitle')}
        subtitle={t('ctaSubtitle')}
        primaryHref="/book"
        primaryLabel={t('cta')}
        secondaryHref="/contact#faq"
        secondaryLabel={t('ctaFaq')}
      />
      <Footer />
    </main>
  );
}
