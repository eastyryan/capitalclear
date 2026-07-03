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
        <p className="mb-12 font-barlow text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {t('effective')}
        </p>
        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={section.heading}>
              <h2 className="font-instrument text-2xl italic leading-none tracking-[-0.5px] text-foreground md:text-3xl">
                <span className="text-ember">{i + 1}.</span> {section.heading}
              </h2>
              <div className="mt-4 space-y-3">
                {section.body.map((p) => (
                  <p
                    key={p.slice(0, 28)}
                    className="font-barlow text-sm font-light leading-relaxed text-muted-foreground"
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
