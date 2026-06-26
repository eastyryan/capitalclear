import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Snowflake, Clock, ShieldCheck, Camera, type LucideIcon } from 'lucide-react';
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
  Feature,
  PhotoFrame
} from '@/components/marketing/parts';

const STAT_ICONS: LucideIcon[] = [Clock, ShieldCheck, Camera, Snowflake];

/**
 * Light, snow-only landing. Photographic hero, a "what we do" section with real
 * snow photography, a how-it-works teaser, stats, a photo strip, and a closing
 * CTA. Built entirely from the shared light marketing primitives.
 */
export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Home' });

  const features = t.raw('whatFeatures') as string[];
  const steps = t.raw('steps') as { title: string; body: string }[];
  const stats = t.raw('stats') as { value: string; label: string }[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        accent={t('heroAccent')}
        subtitle={t('heroSubtitle')}
        image={PHOTOS.hero}
        imageAlt="A snow plow clearing a road during heavy snowfall at dusk"
      >
        <PrimaryCta href="/book">{t('heroPrimary')}</PrimaryCta>
        <GhostCta href="/how-it-works">{t('heroSecondary')}</GhostCta>
      </PageHero>

      <div className="border-b border-border bg-card">
        <p className="mx-auto max-w-6xl px-6 py-4 text-center font-barlow text-sm text-muted-foreground">
          {t('trust')}
        </p>
      </div>

      {/* What we do */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 font-barlow text-sm tracking-wide text-muted-foreground">
              // {t('whatKicker')}
            </div>
            <h2 className="font-instrument text-4xl italic leading-[0.95] tracking-[-1px] text-foreground md:text-5xl">
              {t('whatTitle')} <span className="text-ember">{t('whatAccent')}</span>
            </h2>
            <p className="mt-5 font-barlow text-base font-light leading-relaxed text-muted-foreground">
              {t('whatBody')}
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((f) => (
                <Feature key={f}>{f}</Feature>
              ))}
            </ul>
            <div className="mt-8">
              <PrimaryCta href="/book">{t('heroPrimary')}</PrimaryCta>
            </div>
          </div>
          <PhotoFrame
            src={PHOTOS.driveway}
            alt="A person clearing a residential driveway with a snow shovel"
            className="aspect-[4/3] lg:aspect-auto lg:h-[420px]"
          />
        </div>
      </Section>

      {/* How it works */}
      <div className="bg-card">
        <Section>
          <SectionHeading eyebrow={t('howKicker')} title={t('howTitle')} />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <GlassCard key={step.title} className="flex min-h-[200px] flex-col">
                <NumberBadge n={i + 1} />
                <h3 className="mt-5 font-instrument text-2xl italic leading-none tracking-[-0.5px] text-foreground">
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

      {/* Stats */}
      <Section>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = STAT_ICONS[i % STAT_ICONS.length];
            return (
              <GlassCard key={s.label} className="flex flex-col items-start">
                <IconChip Icon={Icon} />
                <div className="mt-5 font-instrument text-5xl italic leading-none tracking-[-1px] text-foreground">
                  {s.value}
                </div>
                <div className="mt-2 font-barlow text-xs font-light text-muted-foreground">
                  {s.label}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </Section>

      {/* Photo strip */}
      <Section className="pt-0">
        <SectionHeading eyebrow={t('galleryKicker')} title={t('galleryTitle')} />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <PhotoFrame src={PHOTOS.cityPlow} alt="A grader clearing a downtown street in snow" className="h-64" />
          <PhotoFrame src={PHOTOS.snowblower} alt="A resident clearing a walkway with a snowblower" className="h-64" />
          <PhotoFrame src={PHOTOS.roadPlow} alt="A plow truck clearing a snowy road" className="h-64" />
        </div>
      </Section>

      <CtaBand
        title={t('ctaTitle')}
        subtitle={t('ctaSubtitle')}
        primaryHref="/book"
        primaryLabel={t('ctaPrimary')}
        secondaryHref="/become-a-pro"
        secondaryLabel={t('ctaSecondary')}
      />
      <Footer />
    </main>
  );
}
