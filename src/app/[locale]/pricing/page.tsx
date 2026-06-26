import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Snowflake } from 'lucide-react';
import { SERVICE_BASE_CENTS } from '@/lib/pricing/quote';
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
  const ts = await getTranslations({ locale, namespace: 'Services' });

  const money = new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0
  });
  const price = money.format(SERVICE_BASE_CENTS.snow_removal / 100);

  const features = t.raw('features.snow_removal') as string[];
  const billing = t.raw('billing') as { title: string; body: string }[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('accent')}
        subtitle={t('subtitle')}
      />

      <Section className="max-w-3xl">
        <GlassCard className="p-8 md:p-10">
          <div className="flex items-center justify-between">
            <IconChip Icon={Snowflake} className="size-14 rounded-[1rem]" />
            <span className="bg-gradient-ember rounded-full px-3 py-1 font-barlow text-[11px] font-semibold text-white">
              {t('popular')}
            </span>
          </div>

          <h2 className="mt-6 font-instrument text-3xl italic leading-none tracking-[-1px] text-foreground">
            {ts('snow_removal')}
          </h2>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-barlow text-sm text-muted-foreground">{t('from')}</span>
            <span className="font-instrument text-6xl italic tracking-[-1px] text-foreground">
              {price}
            </span>
            <span className="font-barlow text-sm text-muted-foreground">{t('perVisit')}</span>
          </div>

          <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>

          <div className="mt-8">
            <PrimaryCta href="/book">{t('cta')}</PrimaryCta>
          </div>
        </GlassCard>

        <p className="mt-6 text-center font-barlow text-xs font-light text-muted-foreground">
          {t('surgeNote')}
        </p>
      </Section>

      {/* How billing works */}
      <div className="bg-card">
        <Section>
          <SectionHeading
            eyebrow={t('billingKicker')}
            title={t('billingTitle')}
            accent={t('billingAccent')}
          />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {billing.map((b) => (
              <GlassCard key={b.title}>
                <h3 className="font-instrument text-2xl italic leading-none text-foreground">
                  {b.title}
                </h3>
                <p className="mt-3 font-barlow text-sm font-light leading-relaxed text-muted-foreground">
                  {b.body}
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
        secondaryHref="/faq"
        secondaryLabel={t('ctaFaq')}
      />
      <Footer />
    </main>
  );
}
