import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createAdminClient } from '@/lib/supabase/admin';
import type { MoneyLocale } from '@/lib/format/money';
import type { UserRole } from '@/types/database.types';
import { KpiCards } from './_components/KpiCards';
import { JobsTable, type AdminJobRow } from './_components/JobsTable';
import { UsersTable, type AdminUserRow } from './_components/UsersTable';
import { ReviewsTable, type AdminReviewRow } from './_components/ReviewsTable';
import {
  PaymentsTable,
  type AdminPaymentRow,
} from './_components/PaymentsTable';

// Admin dashboard. Server component: reads admin-wide data with the
// service-role client (bypasses RLS — this route is guarded by the (admin)
// layout's requireRole('admin')). Computes KPIs, then renders a KPI row over a
// tabbed view of jobs / users / reviews / payments. Mutations live in the
// client table components, which call the server actions in app/actions/admin.

const RECENT_JOBS_LIMIT = 50;
const RECENT_PAYMENTS_LIMIT = 50;
const RECENT_REVIEWS_LIMIT = 50;

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Admin');
  const moneyLocale: MoneyLocale = locale === 'fr' ? 'fr' : 'en';

  const supabase = createAdminClient();

  // Fan out the reads. Counts use head:true for cheap exact counts; revenue is
  // summed in JS from released payments (no SQL aggregate helper available).
  const [
    jobsCountRes,
    usersCountRes,
    prosCountRes,
    releasedPaymentsRes,
    recentJobsRes,
    profilesRes,
    prosRes,
    reviewsRes,
    paymentsRes,
  ] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('pros').select('user_id', { count: 'exact', head: true }),
    supabase
      .from('payments')
      .select('amount_cents')
      .eq('status', 'released'),
    supabase
      .from('jobs')
      .select(
        'id, service_type, status, homeowner_id, pro_id, final_price_cents, quoted_price_cents, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(RECENT_JOBS_LIMIT),
    supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('pros').select('user_id, verified'),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, reviewer_id, pro_id')
      .order('created_at', { ascending: false })
      .limit(RECENT_REVIEWS_LIMIT),
    supabase
      .from('payments')
      .select('id, job_id, amount_cents, status, created_at')
      .order('created_at', { ascending: false })
      .limit(RECENT_PAYMENTS_LIMIT),
  ]);

  const totalJobs = jobsCountRes.count ?? 0;
  const totalUsers = usersCountRes.count ?? 0;
  const totalPros = prosCountRes.count ?? 0;
  const totalRevenueCents = (releasedPaymentsRes.data ?? []).reduce(
    (sum, p) => sum + (p.amount_cents ?? 0),
    0,
  );

  const profiles = profilesRes.data ?? [];
  const pros = prosRes.data ?? [];

  // Name lookup keyed by profile id — used by Jobs and Reviews tables to show
  // human-readable names instead of raw uuids.
  const nameLookup: Record<
    string,
    { full_name: string | null; email: string | null }
  > = {};
  for (const p of profiles) {
    nameLookup[p.id] = { full_name: p.full_name, email: p.email };
  }

  // Verified flag keyed by pro user id.
  const proVerified: Record<string, boolean> = {};
  for (const pr of pros) {
    proVerified[pr.user_id] = pr.verified;
  }

  const jobs: AdminJobRow[] = recentJobsRes.data ?? [];

  const users: AdminUserRow[] = profiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role as UserRole,
    created_at: p.created_at,
    isPro: p.id in proVerified,
    verified: p.id in proVerified ? proVerified[p.id] : null,
  }));

  const reviews: AdminReviewRow[] = (reviewsRes.data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewerName:
      nameLookup[r.reviewer_id]?.full_name ??
      nameLookup[r.reviewer_id]?.email ??
      null,
    proName:
      nameLookup[r.pro_id]?.full_name ??
      nameLookup[r.pro_id]?.email ??
      null,
  }));

  const payments: AdminPaymentRow[] = paymentsRes.data ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-1">
        <span className="eyebrow">{t('title')}</span>
        <h1 className="mt-1 text-3xl font-semibold tracking-tighter sm:text-4xl">
          {t('title')}
        </h1>
        <p className="max-w-[52ch] text-sm text-[var(--cc-ink-soft)]">{t('subtitle')}</p>
      </header>

      <div className="mb-8">
        <KpiCards
          jobs={totalJobs}
          users={totalUsers}
          pros={totalPros}
          revenueCents={totalRevenueCents}
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
              <JobsTable jobs={jobs} names={nameLookup} locale={moneyLocale} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <UsersTable users={users} locale={moneyLocale} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <ReviewsTable reviews={reviews} locale={moneyLocale} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <PaymentsTable payments={payments} locale={moneyLocale} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
