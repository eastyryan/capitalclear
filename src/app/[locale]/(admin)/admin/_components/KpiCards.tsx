import { useTranslations } from 'next-intl';
import { Briefcase, Users, BadgeCheck, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Money } from '@/components/Money';
import type { MoneyLocale } from '@/lib/format/money';

// KPI summary row. Four stat cards with Geist Mono tabular numerals. Server
// component — pure presentation, no client state. The revenue figure renders
// through <Money/> for locale-aware CAD formatting.

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
      icon: Briefcase,
      value: <span className="font-mono tabular-nums">{jobs}</span>,
      color: 'var(--status-info)',
    },
    {
      key: 'users',
      label: t('kpiUsers'),
      icon: Users,
      value: <span className="font-mono tabular-nums">{users}</span>,
      color: 'var(--status-violet)',
    },
    {
      key: 'pros',
      label: t('kpiPros'),
      icon: BadgeCheck,
      value: <span className="font-mono tabular-nums">{pros}</span>,
      color: 'var(--status-warning)',
    },
    {
      key: 'revenue',
      label: t('kpiRevenue'),
      icon: DollarSign,
      value: (
        <Money cents={revenueCents} locale={locale} className="font-mono" />
      ),
      color: 'var(--status-success)',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, value, color }) => (
        <Card key={key} className="overflow-hidden">
          <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-muted-foreground">{label}</span>
              <span
                className="flex size-8 items-center justify-center rounded-md"
                style={{
                  backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
                  color,
                }}
                aria-hidden
              >
                <Icon className="size-4" />
              </span>
            </div>
            <div className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
              {value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
