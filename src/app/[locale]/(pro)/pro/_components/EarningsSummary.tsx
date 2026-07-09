import { getTranslations } from 'next-intl/server';
import { Star } from 'lucide-react';

import { Money } from '@/components/Money';
import type { MoneyLocale } from '@/lib/format/money';

// Earnings panel for the Pro dashboard's Earnings tab. Pure server component —
// every figure is computed in the page from the pro's jobs/pros row and passed
// in as integer cents. `held` is money authorized on jobs still in flight;
// `released` is money paid out on completed/approved jobs; `total` is the sum.
export async function EarningsSummary({
  heldCents,
  releasedCents,
  jobsCompleted,
  ratingAvg,
  locale,
}: {
  heldCents: number;
  releasedCents: number;
  jobsCompleted: number;
  ratingAvg: number | null;
  locale: MoneyLocale;
}) {
  const t = await getTranslations('ProDashboard');
  const totalCents = heldCents + releasedCents;

  // Pro-only fee disclosure. Kept OUT of the shared message bundle (which
  // next-intl ships to every public page) so this is only ever rendered in the
  // auth-gated pro dashboard — never exposed to the public site.
  const FEE_NOTE = {
    en: {
      title: 'How payouts work',
      body: "You keep 85% of every completed job; Capital Clear keeps a 15% platform fee. Payouts release automatically after the customer's verification window."
    },
    fr: {
      title: 'Comment fonctionnent les versements',
      body: 'Vous gardez 85 % de chaque travail terminé; Capital Clear conserve des frais de plateforme de 15 %. Les versements sont libérés automatiquement après la fenêtre de vérification du client.'
    }
  } as const;
  const fee = FEE_NOTE[locale === 'fr' ? 'fr' : 'en'];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* Ledger rows — hairline-divided list, mono figures. */}
      <dl className="divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)] self-start">
        <div className="flex items-baseline justify-between gap-4 py-4">
          <div>
            <dt className="text-base font-medium tracking-tight text-foreground">
              {t('earningsHeld')}
            </dt>
            <dd className="mt-0.5 font-mono text-xs text-[var(--cc-ink-soft)]">
              {t('earningsHeldHint')}
            </dd>
          </div>
          <dd>
            <Money
              cents={heldCents}
              locale={locale}
              className="font-mono text-lg font-medium text-foreground"
            />
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 py-4">
          <div>
            <dt className="text-base font-medium tracking-tight text-foreground">
              {t('earningsReleased')}
            </dt>
            <dd className="mt-0.5 font-mono text-xs text-[var(--cc-ink-soft)]">
              {t('earningsReleasedHint')}
            </dd>
          </div>
          <dd>
            <Money
              cents={releasedCents}
              locale={locale}
              className="font-mono text-lg font-medium text-foreground"
            />
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 py-4">
          <dt className="text-base font-medium tracking-tight text-foreground">
            {t('jobsCompleted')}
          </dt>
          <dd className="font-mono text-lg font-medium text-foreground tabular-nums">
            {jobsCompleted}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 py-4">
          <dt className="text-base font-medium tracking-tight text-foreground">
            {t('rating')}
          </dt>
          {ratingAvg != null ? (
            <dd className="inline-flex items-center gap-1.5 font-mono text-lg font-medium text-foreground tabular-nums">
              <Star
                className="size-4 fill-[var(--cc-accent)] text-[var(--cc-accent)]"
                aria-hidden
              />
              {ratingAvg.toFixed(1)}
            </dd>
          ) : (
            <dd className="font-mono text-xs text-[var(--cc-ink-soft)]">
              {t('ratingNone')}
            </dd>
          )}
        </div>
      </dl>

      {/* Earnings aside — tint stat card with the payout split. */}
      <aside className="self-start rounded-xl bg-[var(--cc-tint)] p-6">
        <p className="eyebrow">{t('earningsTotal')}</p>
        <Money
          cents={totalCents}
          locale={locale}
          className="mt-3 block font-mono text-5xl font-medium tracking-tighter text-foreground"
        />
        <p className="mt-2 text-xs text-[var(--cc-ink-soft)]">
          {t('earningsTotalHint')}
        </p>

        {/* 85/15 payout split bar. */}
        <div
          className="mt-5 flex h-2 overflow-hidden rounded-full"
          role="img"
          aria-label={fee.title}
        >
          <span className="h-full w-[85%] bg-[var(--cc-accent)]" aria-hidden />
          <span className="h-full flex-1 bg-[var(--cc-ink)]/25" aria-hidden />
        </div>

        {/* Pro-only payout/fee disclosure — never shown on the public site. */}
        <div className="mt-5 border-t border-[var(--cc-line)] pt-4">
          <p className="text-sm font-medium tracking-tight text-foreground">
            {fee.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--cc-ink-soft)]">
            {fee.body}
          </p>
        </div>
      </aside>
    </div>
  );
}
