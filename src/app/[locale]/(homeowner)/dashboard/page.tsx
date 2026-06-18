import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import type { Job, JobStatus } from '@/types/database.types';
import { JobSections, type JobSection } from './_components/JobSections';

// Statuses that count as "active" work the homeowner is currently tracking.
const ACTIVE_STATUSES: JobStatus[] = [
  'posted',
  'accepted',
  'en_route',
  'in_progress',
];

export default async function HomeownerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomeownerDashboard');

  // RLS scopes this to the signed-in homeowner. We still filter by
  // homeowner_id = auth uid defensively so a misconfigured policy can't leak
  // another user's jobs into the view.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = user
    ? await supabase
        .from('jobs')
        .select('*')
        .eq('homeowner_id', user.id)
        .order('scheduled_for', { ascending: true, nullsFirst: false })
    : { data: null };

  const jobs: Job[] = data ?? [];

  // Group once into the four homeowner-facing buckets.
  const active = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status));
  const awaiting = jobs.filter((j) => j.status === 'awaiting_approval');
  const completed = jobs.filter((j) => j.status === 'completed');
  const cancelled = jobs.filter((j) => j.status === 'cancelled');

  const sections: JobSection[] = [
    { key: 'sectionAwaiting', title: t('sectionAwaiting'), jobs: awaiting },
    { key: 'sectionActive', title: t('sectionActive'), jobs: active },
    { key: 'sectionCompleted', title: t('sectionCompleted'), jobs: completed },
    { key: 'sectionCancelled', title: t('sectionCancelled'), jobs: cancelled },
  ].filter((s) => s.jobs.length > 0);

  const isEmpty = jobs.length === 0;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Capital Clear</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link
          href="/book"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'min-h-11 shrink-0',
          )}
        >
          <Plus className="size-4" aria-hidden />
          {t('newBooking')}
        </Link>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <p className="max-w-sm text-muted-foreground">{t('empty')}</p>
          <Link
            href="/book"
            className={cn(buttonVariants({ size: 'lg' }), 'min-h-11')}
          >
            <Plus className="size-4" aria-hidden />
            {t('emptyCta')}
          </Link>
        </div>
      ) : (
        <JobSections sections={sections} />
      )}
    </main>
  );
}
