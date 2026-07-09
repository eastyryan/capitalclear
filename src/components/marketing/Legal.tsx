import { getTranslations } from 'next-intl/server';
import { Footer } from '@/components/site/Footer';
import { PageHero, Section } from '@/components/marketing/parts';

type LegalSection = { heading: string; body: string[] };

/**
 * Shared layout for prose-heavy legal pages (Terms, Privacy). Reads a
 * namespace exposing `eyebrow`, `title`, `effective`, `intro`, and a `sections`
 * array of `{ heading, body[] }`.
 */
export async function LegalPage({
  locale,
  namespace
}: {
  locale: string;
  namespace: string;
}) {
  const t = await getTranslations({ locale, namespace });
  const sections = t.raw('sections') as LegalSection[];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('intro')} />

      <Section className="max-w-3xl">
        <p className="mb-10 border-b border-[var(--cc-line)] pb-6 font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
          {t('effective')}
        </p>
        <div className="divide-y divide-[var(--cc-line)]">
          {sections.map((section, i) => (
            <section key={section.heading} className="py-8 first:pt-0 last:pb-0">
              <h2 className="flex items-baseline gap-3 text-xl font-semibold tracking-tighter text-[var(--cc-ink)] sm:text-2xl">
                <span className="font-mono text-sm font-normal tracking-normal text-[var(--cc-accent)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {section.heading}
              </h2>
              <div className="mt-4 space-y-3">
                {section.body.map((p) => (
                  <p
                    key={p.slice(0, 28)}
                    className="max-w-[65ch] text-sm leading-relaxed text-[var(--cc-ink-soft)]"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>

      <Footer />
    </main>
  );
}
