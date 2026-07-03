import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Mail, MapPin, Clock, Plus, type LucideIcon } from 'lucide-react';
import { Footer } from '@/components/site/Footer';
import { PageHero, Section, GlassCard, IconChip } from '@/components/marketing/parts';
import { ContactForm } from './ContactForm';

const INFO_ICONS: LucideIcon[] = [Mail, MapPin, Clock];

type QA = { q: string; a: string };
type Group = { title: string; items: QA[] };

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
  const tf = await getTranslations({ locale, namespace: 'Faq' });

  const info = t.raw('info') as { label: string; value: string }[];
  const groups = tf.raw('groups') as Group[];

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

      {/* FAQ lives under Contact */}
      <div id="faq" className="scroll-mt-24 bg-card">
        <Section className="max-w-3xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-4 font-barlow text-sm tracking-wide text-muted-foreground">
              // {tf('eyebrow')}
            </div>
            <h2 className="font-instrument text-4xl italic leading-[0.95] tracking-[-1px] text-foreground md:text-5xl">
              {tf('title')} <span className="text-ember">{tf('accent')}</span>
            </h2>
          </div>

          <div className="space-y-12">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-5 font-barlow text-sm tracking-wide text-muted-foreground">
                  // {group.title}
                </h3>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <details
                      key={item.q}
                      className="surface-card group rounded-[1rem] px-5 [&_summary]:list-none"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-barlow text-base font-medium text-foreground">
                        {item.q}
                        <Plus className="size-5 shrink-0 text-primary transition-transform group-open:rotate-45" />
                      </summary>
                      <p className="pb-5 font-barlow text-sm font-light leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Footer />
    </main>
  );
}
