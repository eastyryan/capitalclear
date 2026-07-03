import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  Car,
  Truck,
  Footprints,
  Crown,
  Check,
  Clock,
  ShieldCheck,
  Send,
  type LucideIcon
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Footer } from '@/components/site/Footer';
import { HeroBookingForm } from '@/components/landing/HeroBookingForm';
import { AreaChecker } from '@/components/landing/AreaChecker';
import { StormBanner } from '@/components/landing/StormBanner';
import { Testimonials } from '@/components/landing/Testimonials';
import { JsonLd } from '@/components/landing/JsonLd';

/**
 * Uber.com-style landing rendered in the Azure design system. Structure
 * mirrors uber.com/ca/en: solid-blue nav (global), hero with a request form,
 * how-it-works steps, "Suggestions"-style service cards, per-visit pricing
 * detail, Priority Premium, a brand stats band, and the dark columned footer.
 */

const money = (locale: string, cents: number) =>
  new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0
  }).format(cents / 100);

const TIERS: {
  key: 'single' | 'double' | 'walkway' | 'premium';
  cents: number;
  Icon: LucideIcon;
  featured?: boolean; // "Most booked" badge + blue ring
  outlined?: boolean; // blue ring only (pairs visually with the featured tier)
  addon?: boolean;
  premium?: boolean;
}[] = [
  { key: 'single', cents: 4500, Icon: Car, featured: true },
  { key: 'double', cents: 5500, Icon: Truck },
  { key: 'walkway', cents: 2500, Icon: Footprints, addon: true, outlined: true },
  { key: 'premium', cents: 1000, Icon: Crown, premium: true }
];

const PREMIUM_ICONS: LucideIcon[] = [Crown, ShieldCheck, Clock];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">
      {children}
    </h2>
  );
}

/** Uber-style solid primary button. */
function BtnPrimary({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-medium leading-none text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] active:bg-[var(--primary-pressed)]"
    >
      {children}
    </Link>
  );
}

/** Uber-style quiet underlined text link. */
function BtnLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-base font-medium text-primary underline decoration-[1.5px] underline-offset-4 hover:text-[var(--primary-hover)]"
    >
      {children}
    </Link>
  );
}

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'UberHome' });
  const home = await getTranslations({ locale, namespace: 'Home' });
  const pricing = await getTranslations({ locale, namespace: 'PricingPage' });
  const area = await getTranslations({ locale, namespace: 'AreaCheck' });

  const premium = pricing.raw('premium') as { title: string; body: string }[];
  const stats = home.raw('stats') as { value: string; label: string; desc: string }[];

  return (
    <main className="flex flex-1 flex-col pt-16">
      {/* Structured data for search (LocalBusiness + FAQ rich results) */}
      <JsonLd locale={locale} />

      {/* Storm-watch alert — only renders when snow is in the 3-day forecast */}
      <StormBanner locale={locale} />

      {/* ============ HERO — Uber "Go anywhere" module with request form ============ */}
      <section className="bg-[linear-gradient(180deg,var(--brand-50),transparent_70%)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20 lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
              <Send className="size-3.5" aria-hidden />
              {home('heroEyebrow')}
            </div>
            <h1 className="font-heading text-5xl font-extrabold leading-[0.98] tracking-[-0.03em] text-foreground md:text-6xl lg:text-7xl">
              {t('heroTitle')}
            </h1>

            {/* Functional request form — carries fields to the booking steps */}
            <HeroBookingForm />
          </div>

          {/* Ottawa service-area map */}
          <div className="relative hidden min-h-[420px] overflow-hidden rounded-xl border border-border lg:block">
            <iframe
              title="Capital Clear service area — Ottawa"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d73104.68602989962!2d-75.83189422590335!3d45.372168163323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce05b25f5113af%3A0x8a6a51e131dd15ed!2sOttawa%2C%20ON!5e0!3m2!1sen!2sca!4v1783043750596!5m2!1sen!2sca"
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ============ STATS — blue band (no heading) ============ */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-heading text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
                  {s.value}
                </div>
                <div className="mt-2 text-base font-semibold text-white">{s.label}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES & PER-VISIT PRICING ============ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" id="pricing">
        <SectionTitle>{pricing('sectionTitle')}</SectionTitle>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">{pricing('subtitle')}</p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map(({ key, cents, Icon, featured, outlined, addon, premium }) => {
            const features = pricing.raw(`tiers.${key}.features`) as string[];
            const priceLabel = premium ? pricing('flat') : pricing('perVisit');
            return (
              <div
                key={key}
                className={`flex flex-col rounded-[20px] border bg-card p-7 ${
                  featured || outlined
                    ? 'border-transparent shadow-[inset_0_0_0_2px_var(--color-primary)]'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--brand-50)] text-primary">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  {featured ? (
                    <span className="rounded-sm bg-primary px-2.5 py-1 text-xs font-bold text-white">
                      {pricing('popular')}
                    </span>
                  ) : premium ? (
                    <span className="rounded-sm bg-[var(--brand-100)] px-2.5 py-1 text-xs font-bold text-[var(--brand-700)]">
                      {pricing('premiumKicker')}
                    </span>
                  ) : addon ? (
                    <span className="rounded-sm bg-primary px-2.5 py-1 text-xs font-bold text-white">
                      {pricing('addOn')}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-6 font-heading text-2xl font-bold text-foreground">
                  {pricing(`tiers.${key}.name`)}
                </h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-heading text-5xl font-extrabold tracking-[-0.02em] text-foreground">
                    {addon || premium ? '+' : ''}
                    {money(locale, cents)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{priceLabel}</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/demo/book"
                    className={`inline-flex w-full items-center justify-center rounded-lg px-6 py-3.5 text-base font-medium leading-none transition-colors ${
                      featured || addon
                        ? 'bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]'
                        : 'bg-[var(--brand-100)] text-foreground hover:bg-[var(--brand-200)]'
                    }`}
                  >
                    {pricing('cta')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{pricing('payNote')}</p>
      </section>

      {/* ============ PRIORITY PREMIUM band ============ */}
      <section className="bg-[var(--brand-50)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
            {pricing('premiumKicker')}
          </div>
          <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">
            {pricing('premiumTitle')} {pricing('premiumAccent')}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            {pricing('premiumSubtitle')}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {premium.map((p, i) => {
              const Icon = PREMIUM_ICONS[i % PREMIUM_ICONS.length];
              return (
                <div key={p.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-white">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS (sample data — replace with real reviews) ============ */}
      <Testimonials locale={locale} />

      {/* ============ SERVICE-AREA CHECK ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">
            {area('title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{area('subtitle')}</p>
          <div className="mt-8">
            <AreaChecker />
          </div>
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="max-w-2xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-foreground md:text-5xl">
          {home('ctaTitle')}
        </h2>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">{home('ctaSubtitle')}</p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <BtnPrimary href="/demo/book">{home('ctaPrimary')}</BtnPrimary>
          <BtnLink href="/become-a-pro">{home('ctaSecondary')}</BtnLink>
        </div>
      </section>

      <Footer />
    </main>
  );
}
