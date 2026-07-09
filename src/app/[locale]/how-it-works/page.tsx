import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Footer } from '@/components/site/Footer';

type Step = { title: string; body: string };
type Assurance = { title: string; body: string };

const HOMEOWNER_ICONS = ['cc-icon--pin', 'cc-icon--shovel', 'cc-icon--salt'];
const PRO_ICONS = ['cc-icon--snowflake', 'cc-icon--shovel', 'cc-icon--pin'];

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

function StepGrid({ steps, icons }: { steps: Step[]; icons: string[] }) {
  return (
    <ol className="mt-8 grid grid-cols-1 gap-10 border-t border-[var(--cc-line)] pt-8 sm:grid-cols-3 sm:gap-8">
      {steps.map((step, i) => (
        <li key={step.title}>
          <span
            aria-hidden="true"
            className={`cc-icon ${icons[i % icons.length]} h-12 w-12 sm:h-14 sm:w-14`}
          />
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-xs text-[var(--cc-ink-soft)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="text-base font-medium tracking-tight">{step.title}</h3>
          </div>
          <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-[var(--cc-ink-soft)]">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

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
      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-8 sm:pt-14">
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
            href="/book"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--cc-accent)] px-3.5 py-1.5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
          >
            {t('ctaPrimary')}
            <ArrowSlide />
          </Link>
          <Link
            href="/pricing"
            className="font-mono text-xs text-[var(--cc-ink-soft)] transition-colors duration-150 hover:text-[var(--cc-ink)] motion-reduce:transition-none"
          >
            {t('ctaSecondary')}
          </Link>
        </div>
      </section>

      {/* Homeowner flow */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="mt-16 sm:mt-24">
          <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-accent)]">
            {t('homeownersKicker')}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('homeownersTitle')} {t('homeownersAccent')}
          </h2>
          <StepGrid steps={homeownerSteps} icons={HOMEOWNER_ICONS} />
        </div>
      </section>

      {/* Pro flow */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="mt-16 sm:mt-24">
          <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-accent)]">
            {t('prosKicker')}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('prosTitle')} {t('prosAccent')}
          </h2>
          <StepGrid steps={proSteps} icons={PRO_ICONS} />
        </div>
      </section>

      {/* Assurances */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="mt-16 sm:mt-24">
          <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-accent)]">
            {t('assuranceKicker')}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('assuranceTitle')}
          </h2>
          <ul className="mt-8 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
            {assurances.map((a) => (
              <li
                key={a.title}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <h3 className="text-base font-medium tracking-tight">{a.title}</h3>
                <p className="max-w-[52ch] text-sm leading-relaxed text-[var(--cc-ink-soft)] sm:text-right">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mt-16 border-t border-[var(--cc-line)] pt-10 sm:mt-24">
          <h2 className="text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('ctaTitle')}
          </h2>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
            {t('ctaSubtitle')}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <Link
              href="/book"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--cc-accent)] px-3.5 py-1.5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
            >
              {t('ctaPrimary')}
              <ArrowSlide />
            </Link>
            <Link
              href="/register?role=pro"
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
              {t('ctaPro')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
