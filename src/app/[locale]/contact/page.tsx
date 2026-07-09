import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Footer } from '@/components/site/Footer';
import { PageHero, Section } from '@/components/marketing/parts';
import { ContactForm } from './ContactForm';

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
          <div className="divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
            {info.map((row) => (
              <div key={row.label} className="py-5">
                <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
                  {row.label}
                </div>
                <div className="mt-1.5 text-base font-medium tracking-tight text-[var(--cc-ink)]">
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--cc-line)] bg-white/60 p-6 sm:p-7">
            <h2 className="mb-6 text-2xl font-semibold tracking-tighter text-[var(--cc-ink)]">
              {t('formTitle')}
            </h2>
            <ContactForm />
          </div>
        </div>
      </Section>

      {/* FAQ lives under Contact */}
      <div id="faq" className="scroll-mt-24">
        <Section className="max-w-3xl">
          <div className="mb-10 border-t border-[var(--cc-line)] pt-8">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
              {tf('eyebrow')}
            </div>
            <h2 className="text-3xl font-semibold tracking-tighter text-[var(--cc-ink)] sm:text-4xl">
              {tf('title')} {tf('accent')}
            </h2>
          </div>

          <div className="space-y-12">
            {groups.map((group, gi) => (
              <div key={group.title}>
                <h3 className="mb-2 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
                  <span className="text-[var(--cc-accent)]">
                    {String(gi + 1).padStart(2, '0')}
                  </span>
                  {group.title}
                </h3>
                <div className="divide-y divide-[var(--cc-line)] border-y border-[var(--cc-line)]">
                  {group.items.map((item, qi) => (
                    <details key={item.q} className="group [&_summary]:list-none">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-base font-medium tracking-tight text-[var(--cc-ink)]">
                        <span className="flex items-baseline gap-3">
                          <span className="font-mono text-xs font-normal text-[var(--cc-ink-soft)]">
                            {String(qi + 1).padStart(2, '0')}
                          </span>
                          {item.q}
                        </span>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="size-4 shrink-0 text-[var(--cc-accent)] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                        >
                          <path
                            d="M8 2v12M2 8h12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </summary>
                      <p className="max-w-[65ch] pb-5 pl-8 text-sm leading-relaxed text-[var(--cc-ink-soft)]">
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
