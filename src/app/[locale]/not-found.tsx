import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowSlide, GhostCta } from '@/components/marketing/parts';

/**
 * Locale-scoped 404 — rendered inside the locale layout. Flat paper page:
 * mono eyebrow, tracking-tighter headline, arrow link back home.
 */
export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
        <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
          {t('eyebrow')}
        </div>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tighter text-[var(--cc-ink)] sm:text-6xl">
          {t('title')} {t('accent')}
        </h1>
        <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
          {t('subtitle')}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--cc-accent)] px-5 py-2.5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
          >
            {t('ctaHome')} <ArrowSlide />
          </Link>
          <GhostCta href="/services">{t('ctaServices')}</GhostCta>
        </div>
      </section>
    </main>
  );
}
