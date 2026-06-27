import { getTranslations } from 'next-intl/server';
import { Wallet, BanknoteArrowUp, CircleCheckBig, Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
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
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Wallet className="size-5" aria-hidden />}
          label={t('earningsHeld')}
          hint={t('earningsHeldHint')}
          accentVar="--status-warning"
        >
          <Money
            cents={heldCents}
            locale={locale}
            className="font-mono text-2xl font-semibold text-foreground"
          />
        </StatCard>

        <StatCard
          icon={<BanknoteArrowUp className="size-5" aria-hidden />}
          label={t('earningsReleased')}
          hint={t('earningsReleasedHint')}
          accentVar="--status-success"
        >
          <Money
            cents={releasedCents}
            locale={locale}
            className="font-mono text-2xl font-semibold text-foreground"
          />
        </StatCard>

        <StatCard
          icon={<CircleCheckBig className="size-5" aria-hidden />}
          label={t('earningsTotal')}
          hint={t('earningsTotalHint')}
          accentVar="--primary"
          highlighted
        >
          <Money
            cents={totalCents}
            locale={locale}
            className="font-mono text-2xl font-semibold text-foreground"
          />
        </StatCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleCheckBig className="size-4" aria-hidden />
              {t('jobsCompleted')}
            </div>
            <span className="font-mono text-xl font-semibold text-foreground">
              {jobsCompleted}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="size-4" aria-hidden />
              {t('rating')}
            </div>
            {ratingAvg != null ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-xl font-semibold text-foreground">
                <Star
                  className="size-4 fill-[var(--status-warning)] text-[var(--status-warning)]"
                  aria-hidden
                />
                {ratingAvg.toFixed(1)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t('ratingNone')}
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pro-only payout/fee disclosure — never shown on the public site. */}
      <Card>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Wallet className="size-4" aria-hidden />
            {fee.title}
          </div>
          <p className="text-sm text-muted-foreground">{fee.body}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  hint,
  accentVar,
  highlighted = false,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  accentVar: string;
  highlighted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={highlighted ? 'ring-2 ring-primary/30' : undefined}>
      <CardContent className="flex flex-col gap-2">
        <div
          className="inline-flex w-fit items-center gap-2 text-sm font-medium"
          style={{ color: `var(${accentVar})` }}
        >
          {icon}
          {label}
        </div>
        {children}
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
