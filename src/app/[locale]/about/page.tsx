import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Footer } from '@/components/site/Footer';

function ArrowSlide({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={`h-4 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none ${className}`}
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
  const tHome = await getTranslations({ locale, namespace: 'Home' });

  const story = t.raw('story') as string[];
  const stats = t.raw('stats') as { value: string; label: string }[];
  const values = t.raw('values') as { title: string; body: string }[];
  const steps = tHome.raw('steps') as { title: string; body: string }[];
  const stepIcons = ['cc-icon--pin', 'cc-icon--shovel', 'cc-icon--salt'];

  return (
    <main className="flex flex-1 flex-col pb-4">
      {/* Photo hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-8">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src="/assets/hero-winter.webp"
            alt=""
            className="aspect-[16/10] w-full object-cover sm:aspect-[16/7]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 pb-6 pt-20">
            <h1 className="text-4xl font-semibold tracking-tighter text-white sm:text-6xl">
              <span className="block">{t('heroLine1')}</span>
              <span className="block">{t('heroLine2')}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Intro + signature CTAs */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-12 gap-y-8 sm:mt-14">
          <p className="max-w-[44ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <Link href="/" className="group relative text-xl font-semibold tracking-tight">
              {t('requestService')}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-100 bg-[var(--cc-accent)] transition-transform duration-300 group-hover:scale-x-0 group-hover:[transition-delay:0ms] motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-0.5 w-full origin-right scale-x-0 bg-[var(--cc-ink)] transition-transform delay-150 duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
              />
            </Link>
            <Link
              href="/become-a-pro"
              className="group relative px-4 py-2 text-base font-medium text-[var(--cc-ink)]"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[var(--cc-accent)] transition-all duration-200 group-hover:h-full group-hover:w-2.5 motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[var(--cc-accent)] transition-all duration-200 group-hover:h-full group-hover:w-2.5 motion-reduce:transition-none"
              />
              {t('becomePartner')}
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="mt-16 sm:mt-24">
          <h2 className="text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('howTitle')}
          </h2>
          <ol className="mt-8 grid grid-cols-1 gap-10 border-t border-[var(--cc-line)] pt-8 sm:grid-cols-3 sm:gap-8">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span
                  aria-hidden="true"
                  className={`cc-icon ${stepIcons[i % stepIcons.length]} h-12 w-12 sm:h-14 sm:w-14`}
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
        </div>
      </section>

      {/* Deep band */}
      <section className="mt-16 bg-[var(--cc-deep)] py-14 text-white sm:mt-24 sm:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-12 gap-y-10 px-4 sm:px-8">
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl">
              {t('bandTitle')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">{t('bandBody')}</p>
            <Link
              href="/book"
              className="group mt-6 inline-flex items-center gap-2 text-base font-medium text-white"
            >
              {t('bandCta')}
              <ArrowSlide />
            </Link>
          </div>
          <div>
            <div className="font-mono text-7xl tracking-tighter text-white/90 sm:text-8xl">
              {t('bandStat')}
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-wide text-white/60">
              {t('bandStatLabel')}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="mt-16 sm:mt-24">
          <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-accent)]">
            {t('eyebrow')}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-x-12 gap-y-5 border-t border-[var(--cc-line)] pt-8 lg:grid-cols-3">
            {story.map((p) => (
              <p
                key={p.slice(0, 24)}
                className="text-base leading-relaxed text-[var(--cc-ink-soft)]"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--cc-line)] bg-[var(--cc-line)] sm:mt-24 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[var(--cc-tint)] p-6">
              <div className="font-mono text-4xl tracking-tighter sm:text-5xl">{s.value}</div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mt-16 sm:mt-24">
          <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-accent)]">
            {t('valuesKicker')}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tighter sm:text-3xl">
            {t('valuesTitle')} {t('valuesAccent')}
          </h2>
          <ul className="mt-8 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
            {values.map((v) => (
              <li
                key={v.title}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <h3 className="text-base font-medium tracking-tight">{v.title}</h3>
                <p className="max-w-[52ch] text-sm leading-relaxed text-[var(--cc-ink-soft)] sm:text-right">
                  {v.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
