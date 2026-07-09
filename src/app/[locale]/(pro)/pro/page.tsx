import { setRequestLocale, getTranslations } from 'next-intl/server';

import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from '@/i18n/navigation';
import type { MoneyLocale } from '@/lib/format/money';
import type { Job, JobStatus, ServiceType } from '@/types/database.types';

import { AvailableFeed } from './_components/AvailableFeed';
import { JobCard } from './_components/JobCard';
import { EarningsSummary } from './_components/EarningsSummary';

// Pro dashboard (server component). RLS-scoped via the SSR Supabase client; the
// (pro) route-group layout already enforces requireRole('pro'), so a user only
// reaches here as an authenticated pro. We load:
//   - the pro's `pros` row (services offered + rating)
//   - available jobs   : status='posted', service in the pro's services, untaken
//   - active jobs      : pro_id=me AND status in accepted/en_route/in_progress/
//                        awaiting_approval
//   - completed jobs   : pro_id=me AND status='completed'
// Earnings are computed from the pro's own jobs:
//   - held     = sum(quoted_price_cents) over jobs payment_status='authorized'
//   - released = sum(final_price_cents ?? quoted_price_cents) over completed jobs
//
// The Available tab hosts the AvailableFeed client component, which owns the
// Realtime subscription + optimistic, atomic accept. Everything else is static
// server-rendered cards revalidated by the job Server Actions.

const ACTIVE_STATUSES: JobStatus[] = [
  'accepted',
  'en_route',
  'in_progress',
  'awaiting_approval',
];

type FeedJob = Pick<
  Job,
  | 'id'
  | 'service_type'
  | 'status'
  | 'address'
  | 'postal_code'
  | 'scheduled_for'
  | 'quoted_price_cents'
  | 'final_price_cents'
>;

const JOB_COLUMNS =
  'id, service_type, status, address, postal_code, scheduled_for, quoted_price_cents, final_price_cents';

export default async function ProDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('ProDashboard');
  const moneyLocale: MoneyLocale = locale === 'fr' ? 'fr' : 'en';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The layout guard guarantees an authenticated pro, but narrow for TS and
  // fall back to empty state if the session somehow isn't present.
  const uid = user?.id ?? '';

  // The pro's profile row — services drive the available feed, rating feeds
  // the earnings panel.
  const { data: pro } = await supabase
    .from('pros')
    .select('services, rating_avg, total_jobs_completed')
    .eq('user_id', uid)
    .single();

  const proServices: ServiceType[] = pro?.services ?? [];

  // Fire the buckets in parallel. Available is filtered to the pro's services
  // (an empty service list yields no rows via `.in('service_type', [])`).
  const [availableRes, activeRes, completedRes, heldRes] = await Promise.all([
    proServices.length > 0
      ? supabase
          .from('jobs')
          .select(JOB_COLUMNS)
          .eq('status', 'posted')
          .is('pro_id', null)
          .in('service_type', proServices)
          .order('scheduled_for', { ascending: true })
      : Promise.resolve({ data: [] as FeedJob[] }),
    supabase
      .from('jobs')
      .select(JOB_COLUMNS)
      .eq('pro_id', uid)
      .in('status', ACTIVE_STATUSES)
      .order('scheduled_for', { ascending: true }),
    supabase
      .from('jobs')
      .select(JOB_COLUMNS)
      .eq('pro_id', uid)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false }),
    // Held earnings: every job of mine with an authorized (not yet released)
    // hold. Quoted price is the authorized amount.
    supabase
      .from('jobs')
      .select('quoted_price_cents')
      .eq('pro_id', uid)
      .eq('payment_status', 'authorized'),
  ]);

  const available = (availableRes.data ?? []) as FeedJob[];
  const active = (activeRes.data ?? []) as FeedJob[];
  const completed = (completedRes.data ?? []) as FeedJob[];

  const heldCents = (heldRes.data ?? []).reduce(
    (sum, row) => sum + (row.quoted_price_cents ?? 0),
    0,
  );
  // Released earnings: paid-out completed jobs. Prefer the stamped final price,
  // fall back to the quote.
  const releasedCents = completed.reduce(
    (sum, job) => sum + (job.final_price_cents ?? job.quoted_price_cents ?? 0),
    0,
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-6 flex flex-col gap-1">
        <p className="eyebrow">{t('liveBadge')}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tighter sm:text-4xl">
          {t('title')}
        </h1>
        <p className="max-w-[52ch] text-sm text-[var(--cc-ink-soft)]">
          {t('subtitle')}
        </p>
      </header>

      <Tabs defaultValue="available" className="gap-6">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="available">{t('tabAvailable')}</TabsTrigger>
          <TabsTrigger value="active">{t('tabActive')}</TabsTrigger>
          <TabsTrigger value="completed">{t('tabCompleted')}</TabsTrigger>
          <TabsTrigger value="earnings">{t('tabEarnings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <AvailableFeed initial={available} proServices={proServices} />
        </TabsContent>

        <TabsContent value="active">
          <JobList
            jobs={active}
            emptyLabel={t('activeEmpty')}
            countLabel={t('activeCount', { count: active.length })}
            viewLabel={t('viewJob')}
          />
        </TabsContent>

        <TabsContent value="completed">
          <JobList
            jobs={completed}
            emptyLabel={t('completedEmpty')}
            viewLabel={t('viewJob')}
          />
        </TabsContent>

        <TabsContent value="earnings">
          <EarningsSummary
            heldCents={heldCents}
            releasedCents={releasedCents}
            jobsCompleted={pro?.total_jobs_completed ?? completed.length}
            ratingAvg={pro?.rating_avg ?? null}
            locale={moneyLocale}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

// Static list of job cards with a "View" link to the job detail page. Used for
// the Active and Completed tabs (the Available tab uses the live feed instead).
function JobList({
  jobs,
  emptyLabel,
  countLabel,
  viewLabel,
}: {
  jobs: FeedJob[];
  emptyLabel: string;
  countLabel?: string;
  viewLabel: string;
}) {
  if (jobs.length === 0) {
    return (
      <p className="rounded-xl bg-[var(--cc-tint)] px-4 py-10 text-center text-sm text-[var(--cc-ink-soft)]">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {countLabel ? (
        <p className="font-mono text-xs text-[var(--cc-ink-soft)]">{countLabel}</p>
      ) : null}
      <ul className="divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
        {jobs.map((job) => (
          <li key={job.id}>
            <JobCard
              job={job}
              action={
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--cc-ink-soft)] transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none"
                >
                  {viewLabel}
                </Link>
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
