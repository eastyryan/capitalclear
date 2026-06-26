import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Snowflake } from 'lucide-react';
import { routing } from '@/i18n/routing';
import {
  ALL_SERVICE_SLUGS,
  SERVICE_SLUGS,
  isServiceSlug
} from '@/lib/services';
import { SERVICE_BASE_CENTS } from '@/lib/pricing/quote';
import { PHOTOS } from '@/lib/images';
import { Footer } from '@/components/site/Footer';
import {
  PageHero,
  Section,
  SectionHeading,
  GlassCard,
  CtaBand,
  PrimaryCta,
  GhostCta,
  IconChip,
  NumberBadge,
  Feature
} from '@/components/marketing/parts';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ALL_SERVICE_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  return { title: `${t(`items.${slug}.name`)} · Capital Clear` };
}

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'ServicesPage' });
  const type = SERVICE_SLUGS[slug];

  const money = new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0
  });
  const price = money.format(SERVICE_BASE_CENTS[type] / 100);

  const includes = t.raw(`items.${slug}.includes`) as string[];
  const steps = t.raw(`items.${slug}.steps`) as { title: string; body: string }[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('detailEyebrow')}
        title={t(`items.${slug}.name`)}
        subtitle={t(`items.${slug}.intro`)}
        image={PHOTOS.hero}
        imageAlt="A snow plow clearing a road in heavy snowfall"
      >
        <PrimaryCta href="/book">
          {t('cta')} · {t('from')} {price}
        </PrimaryCta>
        <GhostCta href="/pricing">{t('ctaPricing')}</GhostCta>
      </PageHero>

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <IconChip Icon={Snowflake} className="mb-6 size-14 rounded-[1rem]" />
            <h2 className="font-instrument text-4xl italic leading-[0.95] tracking-[-1px] text-foreground">
              {t(`items.${slug}.whatTitle`)}
            </h2>
            <p className="mt-4 font-barlow text-base font-light leading-relaxed text-muted-foreground">
              {t(`items.${slug}.whatBody`)}
            </p>
          </div>
          <GlassCard className="lg:mt-2">
            <p className="font-barlow text-sm tracking-wide text-muted-foreground">
              // {t('includesTitle')}
            </p>
            <ul className="mt-5 space-y-3">
              {includes.map((item) => (
                <Feature key={item}>{item}</Feature>
              ))}
            </ul>
          </GlassCard>
        </div>
      </Section>

      <div className="bg-card">
        <Section>
          <SectionHeading eyebrow={t('howKicker')} title={t('howTitle')} />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <GlassCard key={step.title} className="flex flex-col">
                <NumberBadge n={i + 1} />
                <h3 className="mt-5 font-instrument text-2xl italic leading-none text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 font-barlow text-sm font-light leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </GlassCard>
            ))}
          </div>
        </Section>
      </div>

      <CtaBand
        title={t(`items.${slug}.ctaTitle`)}
        subtitle={t(`items.${slug}.ctaSubtitle`)}
        primaryHref="/book"
        primaryLabel={t('cta')}
        secondaryHref="/how-it-works"
        secondaryLabel={t('ctaHow')}
      />
      <Footer />
    </main>
  );
}
