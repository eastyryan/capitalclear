import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Plus } from 'lucide-react';
import { Footer } from '@/components/site/Footer';
import { PageHero, Section, CtaBand } from '@/components/marketing/parts';

type QA = { q: string; a: string };
type Group = { title: string; items: QA[] };

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Faq' });
  return { title: `${t('metaTitle')} · Capital Clear` };
}

export default async function FaqPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Faq' });

  const groups = t.raw('groups') as Group[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('accent')}
        subtitle={t('subtitle')}
      />

      <Section className="max-w-3xl">
        <div className="space-y-12">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-5 font-barlow text-sm tracking-wide text-muted-foreground">
                // {group.title}
              </h2>
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

      <CtaBand
        title={t('ctaTitle')}
        subtitle={t('ctaSubtitle')}
        primaryHref="/contact"
        primaryLabel={t('ctaContact')}
        secondaryHref="/book"
        secondaryLabel={t('ctaBook')}
      />
      <Footer />
    </main>
  );
}
