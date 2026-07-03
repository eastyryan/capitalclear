import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Car, Truck, Footprints, Check, MapPin, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { SERVICE_AREAS, getArea } from '@/lib/areas';
import { AreaChecker } from '@/components/landing/AreaChecker';
import { Footer } from '@/components/site/Footer';

/**
 * Local-SEO landing page per service area ("Barrhaven snow removal", ...).
 * Statically generated for every area × locale. Same Azure look as the rest
 * of the marketing site: blue banner header, per-visit pricing, booking CTA.
 */

const TIERS: { key: 'single' | 'double' | 'walkway'; cents: number; Icon: LucideIcon; addon?: boolean }[] = [
  { key: 'single', cents: 4500, Icon: Car },
  { key: 'double', cents: 5500, Icon: Truck },
  { key: 'walkway', cents: 2500, Icon: Footprints, addon: true }
];

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICE_AREAS.map((a) => ({ locale, slug: a.slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const area = getArea(slug);
  if (!area) return {};
  const t = await getTranslations({ locale, namespace: 'AreaPage' });
  const name = area.name[locale === 'fr' ? 'fr' : 'en'];
  return {
    title: `${t('metaTitle', { area: name })} · Capital Clear`,
    description: area.blurb[locale === 'fr' ? 'fr' : 'en']
  };
}

export default async function AreaPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'AreaPage' });
  const pricing = await getTranslations({ locale, namespace: 'PricingPage' });
  const check = await getTranslations({ locale, namespace: 'AreaCheck' });
  const lang = locale === 'fr' ? 'fr' : 'en';
  const name = area.name[lang];

  const money = new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0
  });

  return (
    <main className="flex flex-1 flex-col">
      {/* Blue banner header */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_82%_18%,var(--brand-300),transparent_55%),linear-gradient(150deg,var(--brand-500)_0%,var(--brand-700)_100%)] text-white">
        <div
          className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,.16)_1.5px,transparent_1.5px)] [background-size:24px_24px]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-32 text-center sm:pt-40">
          <div className="mb-5 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white/80">
            <MapPin className="size-4" aria-hidden />
            {t('eyebrow')}
          </div>
          <h1 className="font-heading text-4xl font-extrabold leading-[1] tracking-[-0.03em] md:text-6xl">
            {t('title', { area: name })}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85">
            {area.blurb[lang]}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70">
            {t('landmarks', { landmarks: area.landmarks[lang] })}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {area.fsas.map((fsa) => (
              <span
                key={fsa}
                className="rounded-full border border-white/30 px-3 py-1 font-mono text-xs font-bold tracking-[0.08em]"
              >
                {fsa}
              </span>
            ))}
          </div>
          <div className="mt-9">
            <Link
              href="/demo/book"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5"
            >
              {t('cta', { area: name })}
            </Link>
          </div>
        </div>
      </section>

      {/* Per-visit pricing summary */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">
          {t('pricingTitle', { area: name })}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">{pricing('payNote')}</p>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map(({ key, cents, Icon, addon }) => {
            const features = pricing.raw(`tiers.${key}.features`) as string[];
            return (
              <div key={key} className="flex flex-col rounded-[20px] border border-border bg-card p-7">
                <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--brand-50)] text-primary">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                  {pricing(`tiers.${key}.name`)}
                </h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-heading text-4xl font-extrabold tracking-[-0.02em] text-foreground">
                    {addon ? '+' : ''}
                    {money.format(cents / 100)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{pricing('perVisit')}</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Postal check + CTA */}
      <section className="border-t border-border bg-[var(--brand-50)]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-foreground">
            {check('title')}
          </h2>
          <div className="mt-8">
            <AreaChecker />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
