import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Wallet, CalendarClock, MapPinned, Camera, type LucideIcon } from 'lucide-react';
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
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('accent')}
        subtitle={t('subtitle')}
        image={PHOTOS.roadPlow}
        imageAlt="A plow truck clearing a snowy road"
      >
        <PrimaryCta href="/register?role=pro">{t('ctaPrimary')}</PrimaryCta>
        <GhostCta href="/how-it-works">{t('ctaSecondary')}</GhostCta>
      </PageHero>

      {/* Earnings split */}
      <Section className="max-w-3xl">
        <GlassCard className="p-8 text-center md:p-12">
          <p className="font-barlow text-sm tracking-wide text-muted-foreground">
            // {t('earningsKicker')}
          </p>
          <div className="mt-4 font-instrument text-7xl italic leading-none tracking-[-2px] text-foreground md:text-8xl">
            <span className="text-ember">{t('keepPct')}</span>
          </div>
          <p className="mx-auto mt-5 max-w-xl font-barlow text-base font-light leading-relaxed text-muted-foreground">
            {t('earningsBody')}
          </p>
        </GlassCard>
      </Section>

      {/* Benefits */}
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

      {/* Steps + requirements */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
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

          <GlassCard>
            <p className="font-barlow text-sm tracking-wide text-muted-foreground">
              // {t('requirementsTitle')}
            </p>
            <ul className="mt-5 space-y-3">
              {requirements.map((r) => (
                <Feature key={r}>{r}</Feature>
              ))}
            </ul>
          </GlassCard>
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
