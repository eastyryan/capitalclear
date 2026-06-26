import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Camera, ShieldCheck, Wallet, Clock, type LucideIcon } from 'lucide-react';
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
  NumberBadge
} from '@/components/marketing/parts';

type Step = { title: string; body: string };
type Assurance = { title: string; body: string };

const ASSURANCE_ICONS: LucideIcon[] = [Camera, ShieldCheck, Wallet, Clock];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HowItWorks' });
  return { title: `${t('metaTitle')} · Capital Clear` };
}

export default async function HowItWorksPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'HowItWorks' });

  const homeownerSteps = t.raw('homeownersSteps') as Step[];
  const proSteps = t.raw('prosSteps') as Step[];
  const assurances = t.raw('assurances') as Assurance[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('accent')}
        subtitle={t('subtitle')}
        image={PHOTOS.cityPlow}
        imageAlt="A plow clearing a city street in winter"
      >
        <PrimaryCta href="/book">{t('ctaPrimary')}</PrimaryCta>
        <GhostCta href="/pricing">{t('ctaSecondary')}</GhostCta>
      </PageHero>

      {/* Homeowner flow */}
      <Section>
        <SectionHeading
          eyebrow={t('homeownersKicker')}
          title={t('homeownersTitle')}
          accent={t('homeownersAccent')}
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {homeownerSteps.map((step, i) => (
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

      {/* Pro flow */}
      <div className="bg-card">
        <Section>
          <SectionHeading
            eyebrow={t('prosKicker')}
            title={t('prosTitle')}
            accent={t('prosAccent')}
          />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {proSteps.map((step, i) => (
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

      {/* Assurances */}
      <Section>
        <SectionHeading eyebrow={t('assuranceKicker')} title={t('assuranceTitle')} />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {assurances.map((a, i) => (
            <GlassCard key={a.title} className="flex flex-col">
              <IconChip Icon={ASSURANCE_ICONS[i % ASSURANCE_ICONS.length]} />
              <h3 className="mt-5 font-instrument text-xl italic leading-none text-foreground">
                {a.title}
              </h3>
              <p className="mt-2 font-barlow text-sm font-light leading-relaxed text-muted-foreground">
                {a.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <CtaBand
        title={t('ctaTitle')}
        subtitle={t('ctaSubtitle')}
        primaryHref="/book"
        primaryLabel={t('ctaPrimary')}
        secondaryHref="/register?role=pro"
        secondaryLabel={t('ctaPro')}
      />
      <Footer />
    </main>
  );
}
