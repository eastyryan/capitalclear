import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Footer } from '@/components/site/Footer';

function ArrowSlide() {
  return (
    <svg
      viewBox="0 0 20 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="h-4 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
    >
      <path d="M2 8h15" />
      <path d="M12 3l5 5-5 5" />
    </svg>
  );
}

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
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-8">
        {/* Hero */}
        <section className="pt-8 sm:pt-14">
          <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-accent)]">
            {t('eyebrow')}
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tighter sm:text-5xl">
            {t('title')} {t('accent')}
          </h1>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="/register?role=pro"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--cc-accent)] px-3.5 py-1.5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
            >
              {t('ctaPrimary')}
              <ArrowSlide />
            </Link>
            <Link
              href="/how-it-works"
              className="font-mono text-xs text-[var(--cc-ink-soft)] transition-colors duration-150 hover:text-[var(--cc-ink)] motion-reduce:transition-none"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </section>

        {/* Benefits list + earnings aside */}
        <section className="mt-16 grid grid-cols-1 gap-x-12 gap-y-12 sm:mt-24 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-accent)]">
              {t('benefitsKicker')}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tighter sm:text-3xl">
              {t('benefitsTitle')}
            </h2>
            <ul className="mt-8 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
              {benefits.map((b, i) => (
                <li key={b.title} className="flex gap-5 py-4">
                  <span className="pt-0.5 font-mono text-xs text-[var(--cc-ink-soft)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-base font-medium tracking-tight">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--cc-ink-soft)]">
                      {b.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* How earnings work — tint aside */}
          <aside className="rounded-xl bg-[var(--cc-tint)] p-6">
            <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
              {t('earningsKicker')}
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tighter sm:text-2xl">
              {t('earningsTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--cc-ink-soft)]">
              {t('earningsBody')}
            </p>
            <div className="mt-6 border-t border-[var(--cc-line)] pt-4">
              <Link
                href="/register?role=pro"
                className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--cc-accent)]"
              >
                {t('ctaPrimary')}
                <ArrowSlide />
              </Link>
            </div>
          </aside>
        </section>

        {/* Steps */}
        <section className="mt-16 sm:mt-24">
          <h2 className="text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('stepsTitle')}
          </h2>
          <ol className="mt-8 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-xs text-[var(--cc-ink-soft)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-medium tracking-tight">{step.title}</h3>
                </div>
                <p className="max-w-[48ch] text-sm leading-relaxed text-[var(--cc-ink-soft)] sm:text-right">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Requirements */}
        <section className="mt-16 sm:mt-24">
          <h2 className="text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('requirementsTitle')}
          </h2>
          <ul className="mt-8 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
            {requirements.map((r) => (
              <li key={r} className="flex items-baseline gap-5 py-4">
                <span aria-hidden="true" className="font-mono text-xs text-[var(--cc-accent)]">
                  ✓
                </span>
                <span className="font-mono text-xs text-[var(--cc-ink-soft)]">{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing CTA */}
        <section className="mt-16 border-t border-[var(--cc-line)] pb-16 pt-10 sm:mt-24 sm:pb-24">
          <h2 className="text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('ctaTitle')}
          </h2>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
            {t('ctaSubtitle')}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <Link
              href="/register?role=pro"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--cc-accent)] px-3.5 py-1.5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
            >
              {t('ctaPrimary')}
              <ArrowSlide />
            </Link>
            <Link
              href="/contact"
              className="group relative px-4 py-2 text-sm font-medium text-[var(--cc-ink)]"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[var(--cc-accent)] transition-all duration-200 group-hover:h-full group-hover:w-2.5 motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[var(--cc-accent)] transition-all duration-200 group-hover:h-full group-hover:w-2.5 motion-reduce:transition-none"
              />
              {t('ctaContact')}
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
