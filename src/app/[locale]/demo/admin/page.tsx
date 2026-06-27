import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { MoneyLocale } from '@/lib/format/money';
import { KpiCards } from '../../(admin)/admin/_components/KpiCards';
import { JobsTable } from '../../(admin)/admin/_components/JobsTable';
import { UsersTable } from '../../(admin)/admin/_components/UsersTable';
import { ReviewsTable } from '../../(admin)/admin/_components/ReviewsTable';
import { PaymentsTable } from '../../(admin)/admin/_components/PaymentsTable';
import {
  ADMIN_KPIS,
  ADMIN_JOBS,
  ADMIN_USERS,
  ADMIN_REVIEWS,
  ADMIN_PAYMENTS,
  ADMIN_NAMES
} from '../_mock';

export default async function DemoAdmin({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');
  const moneyLocale: MoneyLocale = locale === 'fr' ? 'fr' : 'en';

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-1">
        <span className="eyebrow text-muted-foreground">{t('title')}</span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="mb-8">
        <KpiCards
          jobs={ADMIN_KPIS.jobs}
          users={ADMIN_KPIS.users}
          pros={ADMIN_KPIS.pros}
          revenueCents={ADMIN_KPIS.revenueCents}
          locale={moneyLocale}
        />
      </div>

      <Tabs defaultValue="jobs" className="gap-6">
        <TabsList className="w-full max-w-xl overflow-x-auto">
          <TabsTrigger value="jobs">{t('tabJobs')}</TabsTrigger>
          <TabsTrigger value="users">{t('tabUsers')}</TabsTrigger>
          <TabsTrigger value="reviews">{t('tabReviews')}</TabsTrigger>
          <TabsTrigger value="payments">{t('tabPayments')}</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <JobsTable jobs={ADMIN_JOBS} names={ADMIN_NAMES} locale={moneyLocale} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <UsersTable users={ADMIN_USERS} locale={moneyLocale} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <ReviewsTable reviews={ADMIN_REVIEWS} locale={moneyLocale} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <PaymentsTable payments={ADMIN_PAYMENTS} locale={moneyLocale} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
