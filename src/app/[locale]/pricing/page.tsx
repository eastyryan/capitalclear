import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Car, Truck, Footprints, Crown, Clock, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Footer } from '@/components/site/Footer';
import {
  PageHero,
  Section,
  SectionHeading,
  GlassCard,
  CtaBand,
  PrimaryCta,
  IconChip,
  Feature
} from '@/components/marketing/parts';

// Three per-visit tiers. Walkway is an add-on (price shown with a leading +).
const TIERS: { key: 'single' | 'double' | 'walkway'; cents: number; Icon: LucideIcon; featured?: boolean; addon?: boolean }[] = [
  { key: 'single', cents: 4500, Icon: Car },
  { key: 'double', cents: 5500, Icon: Truck, featured: true },
  { key: 'walkway', cents: 2500, Icon: Footprints, addon: true }
];

const PREMIUM_ICONS: LucideIcon[] = [Crown, ShieldCheck, Clock];

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

      {/* Three per-visit tiers */}
      <Section>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map(({ key, cents, Icon, featured, addon }) => {
            const features = t.raw(`tiers.${key}.features`) as string[];
            const priceText = `${addon ? '+' : ''}${money.format(cents / 100)}`;
            return (
              <GlassCard
                key={key}
                className={`flex flex-col ${featured ? 'ring-2 ring-primary/40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <IconChip Icon={Icon} />
                  {featured ? (
                    <span className="bg-gradient-ember rounded-full px-3 py-1 font-barlow text-[11px] font-semibold text-white">
                      {t('popular')}
                    </span>
                  ) : addon ? (
                    <span className="rounded-full border border-brand-green/40 px-3 py-1 font-barlow text-[11px] font-semibold text-brand-green">
                      {t('addOn')}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-6 font-instrument text-3xl italic leading-none tracking-[-1px] text-foreground">
                  {t(`tiers.${key}.name`)}
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-instrument text-6xl italic tracking-[-1px] text-foreground">
                    {priceText}
                  </span>
                  <span className="font-barlow text-sm text-muted-foreground">{t('perVisit')}</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {features.map((f) => (
                    <Feature key={f}>{f}</Feature>
                  ))}
                </ul>

                <div className="mt-8">
                  <PrimaryCta href="/book">{t('cta')}</PrimaryCta>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <p className="mt-6 text-center font-barlow text-xs font-light text-muted-foreground">
          {t('payNote')}
        </p>
      </Section>

      {/* Priority Premium (consumer) */}
      <div className="bg-card">
        <Section>
          <SectionHeading
            eyebrow={t('premiumKicker')}
            title={t('premiumTitle')}
            accent={t('premiumAccent')}
            subtitle={t('premiumSubtitle')}
          />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {premium.map((p, i) => (
              <GlassCard key={p.title} className="flex flex-col">
                <IconChip Icon={PREMIUM_ICONS[i % PREMIUM_ICONS.length]} className="chip-green" />
                <h3 className="mt-5 font-instrument text-2xl italic leading-none text-foreground">
                  {p.title}
                </h3>
                <p className="mt-3 font-barlow text-sm font-light leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </GlassCard>
            ))}
          </div>
        </Section>
      </div>

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
