import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Wallet, CalendarClock, MapPinned, Camera, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Footer } from '@/components/site/Footer';
import {
  Section,
  SectionHeading,
  GlassCard,
  CtaBand,
  IconChip,
  NumberBadge
} from '@/components/marketing/parts';

const BENEFIT_ICONS: LucideIcon[] = [Wallet, CalendarClock, MapPinned, Camera];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BecomePro' });
  return { title: `${t('metaTitle')} · Capital Clear` };
}

export default async function BecomeProPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BecomePro' });

  const benefits = t.raw('benefits') as { title: string; body: string }[];
  const steps = t.raw('steps') as { title: string; body: string }[];
  const requirements = t.raw('requirements') as string[];

  return (
    <main className="flex flex-1 flex-col">
      {/* ============ HEADER — photo-free blue banner ============ */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_82%_18%,var(--brand-300),transparent_55%),linear-gradient(150deg,var(--brand-500)_0%,var(--brand-700)_100%)] text-white">
        <div
          className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,.16)_1.5px,transparent_1.5px)] [background-size:24px_24px]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-32 text-center sm:pt-40">
          <div className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white/80">
            {t('eyebrow')}
          </div>
          <h1 className="font-heading text-5xl font-extrabold leading-[0.98] tracking-[-0.03em] md:text-7xl">
            {t('title')} {t('accent')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            {t('subtitle')}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register?role=pro"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5"
            >
              {t('ctaPrimary')} <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {t('ctaSecondary')}
            </Link>
          </div>

          {/* Earnings note, folded into the header */}
          <p className="mx-auto mt-10 max-w-2xl border-t border-white/15 pt-8 text-sm leading-relaxed text-white/75">
            <span className="font-semibold text-white">{t('earningsTitle')} </span>
            {t('earningsBody')}
          </p>
        </div>
      </section>

      {/* Benefits — "Built around your schedule" (unchanged) */}
      <div className="bg-card">
        <Section>
          <SectionHeading eyebrow={t('benefitsKicker')} title={t('benefitsTitle')} />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <GlassCard key={b.title} className="flex flex-col">
                <IconChip Icon={BENEFIT_ICONS[i % BENEFIT_ICONS.length]} />
                <h3 className="mt-5 font-instrument text-xl italic leading-none text-foreground">
                  {b.title}
                </h3>
                <p className="mt-2 font-barlow text-sm font-light leading-relaxed text-muted-foreground">
                  {b.body}
                </p>
              </GlassCard>
            ))}
          </div>
        </Section>
      </div>

      {/* Steps + requirements — two matching columns */}
      <Section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          {/* Start in three steps (unchanged) */}
          <div>
            <h2 className="font-instrument text-4xl italic leading-[0.95] tracking-[-1px] text-foreground">
              {t('stepsTitle')}
            </h2>
            <div className="mt-8 space-y-5">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <NumberBadge n={i + 1} />
                  <div>
                    <h3 className="font-instrument text-2xl italic leading-none text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-barlow text-sm font-light leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What you'll need — same layout as the steps, without numbers */}
          <div>
            <h2 className="font-instrument text-4xl italic leading-[0.95] tracking-[-1px] text-foreground">
              {t('requirementsTitle')}
            </h2>
            <div className="mt-8 space-y-5">
              {requirements.map((r) => (
                <div key={r}>
                  <h3 className="font-instrument text-2xl italic leading-none text-foreground">
                    {r}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        title={t('ctaTitle')}
        subtitle={t('ctaSubtitle')}
        primaryHref="/register?role=pro"
        primaryLabel={t('ctaPrimary')}
        secondaryHref="/contact"
        secondaryLabel={t('ctaContact')}
      />
      <Footer />
    </main>
  );
}
