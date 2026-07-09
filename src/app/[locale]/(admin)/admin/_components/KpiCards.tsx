import { useTranslations } from 'next-intl';
import { Money } from '@/components/Money';
import type { MoneyLocale } from '@/lib/format/money';

// KPI summary row. Four tint stat tiles with mono numerals (spec: aside/stat
// card recipe — rounded-xl tint surface, mono uppercase eyebrow, big mono
// number). Server component — pure presentation, no client state. The revenue
// figure renders through <Money/> for locale-aware CAD formatting.

type KpiCardsProps = {
  jobs: number;
  users: number;
  pros: number;
  revenueCents: number;
  locale: MoneyLocale;
};

export function KpiCards({
  jobs,
  users,
  pros,
  revenueCents,
  locale,
}: KpiCardsProps) {
  const t = useTranslations('Admin');

  const stats = [
    {
      key: 'jobs',
      label: t('kpiJobs'),
      value: <span className="font-mono tabular-nums">{jobs}</span>,
    },
    {
      key: 'users',
      label: t('kpiUsers'),
      value: <span className="font-mono tabular-nums">{users}</span>,
    },
    {
      key: 'pros',
      label: t('kpiPros'),
      value: <span className="font-mono tabular-nums">{pros}</span>,
    },
    {
      key: 'revenue',
      label: t('kpiRevenue'),
      value: (
        <Money cents={revenueCents} locale={locale} className="font-mono" />
      ),
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map(({ key, label, value }) => (
        <div key={key} className="rounded-xl bg-[var(--cc-tint)] p-5 sm:p-6">
          <p className="eyebrow">{label}</p>
          <p className="mt-3 text-3xl font-medium tracking-tighter text-foreground sm:text-4xl">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
