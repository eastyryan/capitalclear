import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Mail, MapPin, Clock, type LucideIcon } from 'lucide-react';
import { Footer } from '@/components/site/Footer';
import { PageHero, Section, GlassCard, IconChip } from '@/components/marketing/parts';
import { ContactForm } from './ContactForm';

const INFO_ICONS: LucideIcon[] = [Mail, MapPin, Clock];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });
  return { title: `${t('metaTitle')} · Capital Clear` };
}

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Contact' });

  const info = t.raw('info') as { label: string; value: string }[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('accent')}
        subtitle={t('subtitle')}
      />

      <Section className="max-w-5xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            {info.map((row, i) => (
              <GlassCard key={row.label} className="flex items-start gap-4">
                <IconChip Icon={INFO_ICONS[i % INFO_ICONS.length]} />
                <div>
                  <div className="font-barlow text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {row.label}
                  </div>
                  <div className="mt-1 font-barlow text-base text-foreground">{row.value}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-7">
            <h2 className="mb-6 font-instrument text-3xl italic leading-none tracking-[-1px] text-foreground">
              {t('formTitle')}
            </h2>
            <ContactForm />
          </GlassCard>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
