import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MapPin, Users, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import { PHOTOS } from '@/lib/images';
import { Footer } from '@/components/site/Footer';
import {
  PageHero,
  Section,
  SectionHeading,
  GlassCard,
  CtaBand,
  IconChip,
  PhotoFrame
} from '@/components/marketing/parts';

const VALUE_ICONS: LucideIcon[] = [MapPin, Users, ShieldCheck, Sparkles];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return { title: `${t('metaTitle')} · Capital Clear` };
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'About' });

  const story = t.raw('story') as string[];
  const stats = t.raw('stats') as { value: string; label: string }[];
  const values = t.raw('values') as { title: string; body: string }[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('accent')}
        subtitle={t('subtitle')}
      />

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-5">
            {story.map((p) => (
              <p
                key={p.slice(0, 24)}
                className="font-barlow text-base font-light leading-relaxed text-muted-foreground"
              >
                {p}
              </p>
            ))}
          </div>
          <PhotoFrame
            src={PHOTOS.snowblower}
            alt="A resident clearing a snowy walkway in a Canadian neighbourhood"
            className="aspect-[4/5] lg:aspect-auto lg:h-[460px]"
          />
        </div>
      </Section>

      <div className="bg-card">
        <Section>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((s) => (
              <GlassCard key={s.label} className="text-center">
                <div className="font-instrument text-5xl italic leading-none tracking-[-1px] text-foreground">
                  {s.value}
                </div>
                <div className="mt-2 font-barlow text-xs font-light text-muted-foreground">
                  {s.label}
                </div>
              </GlassCard>
            ))}
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeading
          eyebrow={t('valuesKicker')}
          title={t('valuesTitle')}
          accent={t('valuesAccent')}
        />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <GlassCard key={v.title} className="flex flex-col">
              <IconChip Icon={VALUE_ICONS[i % VALUE_ICONS.length]} />
              <h3 className="mt-5 font-instrument text-xl italic leading-none text-foreground">
                {v.title}
              </h3>
              <p className="mt-2 font-barlow text-sm font-light leading-relaxed text-muted-foreground">
                {v.body}
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
        secondaryHref="/become-a-pro"
        secondaryLabel={t('ctaPro')}
      />
      <Footer />
    </main>
  );
}
