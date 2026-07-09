import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
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
  CtaBand,
  PrimaryCta,
  GhostCta,
  NumberBadge,
  Feature
} from '@/components/marketing/parts';

// Sprite icons per service type — winter services use the winter row.
const SERVICE_ICONS: Record<string, string> = {
  snow_removal: 'snowflake',
  lawn_mowing: 'mower'
};

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
  const icon = SERVICE_ICONS[type] ?? 'snowflake';

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
          {t('cta')} · <span className="font-mono">{t('from')} {price}</span>
        </PrimaryCta>
        <GhostCta href="/pricing">{t('ctaPricing')}</GhostCta>
      </PageHero>

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <span aria-hidden="true" className={`cc-icon cc-icon--${icon} mb-6 block h-14 w-14`} />
            <h2 className="text-3xl font-semibold tracking-tighter text-[var(--cc-ink)] sm:text-4xl">
              {t(`items.${slug}.whatTitle`)}
            </h2>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
              {t(`items.${slug}.whatBody`)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--cc-line)] p-6 lg:mt-2">
            <p className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
              {t('includesTitle')}
            </p>
            <ul className="mt-5 divide-y divide-[var(--cc-line)] [&>li]:py-3 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0">
              {includes.map((item) => (
                <Feature key={item}>{item}</Feature>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow={t('howKicker')} title={t('howTitle')} />
        <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col">
              <NumberBadge n={i + 1} />
              <h3 className="mt-5 text-lg font-semibold tracking-tighter text-[var(--cc-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-[var(--cc-ink-soft)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

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
