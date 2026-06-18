import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MapPin, CalendarClock, FileText, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSignedPhotoUrls } from '@/app/actions/photos';
import { ServiceBadge } from '@/components/jobs/ServiceBadge';
import { StatusBadge } from '@/components/jobs/StatusBadge';
import { Money } from '@/components/Money';
import type { MoneyLocale } from '@/lib/format/money';
import { StatusTimeline } from './_components/StatusTimeline';
import { BeforeAfterGallery } from './_components/BeforeAfterGallery';
import { ActionBar } from './_components/ActionBar';

// Phase 5 — Job detail (server component).
//
// RLS guarantees only participants (the owning homeowner, the assigned pro) or
// an admin can read the row, so a null fetch result is treated as not-found.
// We resolve the viewer's role here on the server and pass plain flags down to
// the client ActionBar — identity is never re-derived in the browser.

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

// Render a scheduled timestamp in Ottawa local time, locale-aware.
function formatSchedule(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Toronto',
    timeZoneName: 'short',
  }).format(date);
}

export default async function JobDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('JobDetail');
  const moneyLocale: MoneyLocale = locale === 'fr' ? 'fr' : 'en';

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the job (RLS-scoped). Non-participants get no row -> notFound.
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  // Resolve the viewer's role relative to this job. The assigned-pro check is
  // guarded: only true when there IS a pro_id and it matches the viewer.
  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    : { data: null };

  const isAssignedPro =
    !!user && job.pro_id !== null && job.pro_id === user.id;
  const isHomeowner = !!user && job.homeowner_id === user.id;
  const isAdmin = profile?.role === 'admin';

  // Signed photo URLs (action enforces participant access via RLS).
  const photosResult = await getSignedPhotoUrls(id);
  const before = photosResult.ok ? photosResult.data.before : [];
  const after = photosResult.ok ? photosResult.data.after : [];

  // Does a review already exist for this job? (Only relevant to the homeowner
  // after completion.) RLS lets participants read the row if present.
  let hasReview = false;
  if (job.status === 'completed') {
    const { count } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', id);
    hasReview = (count ?? 0) > 0;
  }

  const scheduled = formatSchedule(job.scheduled_for, locale);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28 sm:pb-12">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('back')}
      </Link>

      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ServiceBadge
            service={job.service_type}
            className="text-base font-medium"
          />
          <StatusBadge status={job.status} />
        </div>

        <dl className="flex flex-col gap-3 text-sm">
          {job.address && (
            <div className="flex items-start gap-2.5">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div>
                <dt className="sr-only">{t('address')}</dt>
                <dd className="text-foreground">{job.address}</dd>
                <dd className="font-mono text-xs text-muted-foreground">
                  {job.postal_code}
                </dd>
              </div>
            </div>
          )}

          {scheduled && (
            <div className="flex items-start gap-2.5">
              <CalendarClock
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div>
                <dt className="sr-only">{t('scheduledFor')}</dt>
                <dd className="text-foreground">{scheduled}</dd>
              </div>
            </div>
          )}

          {job.notes && (
            <div className="flex items-start gap-2.5">
              <FileText
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div>
                <dt className="sr-only">{t('notes')}</dt>
                <dd className="text-muted-foreground">{job.notes}</dd>
              </div>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t pt-4">
          {job.quoted_price_cents != null && (
            <div>
              <span className="eyebrow text-muted-foreground">
                {t('quote')}
              </span>
              <Money
                cents={job.quoted_price_cents}
                locale={moneyLocale}
                className="block text-lg font-semibold text-foreground"
              />
            </div>
          )}
          {job.final_price_cents != null && (
            <div>
              <span className="eyebrow text-muted-foreground">
                {t('finalPrice')}
              </span>
              <Money
                cents={job.final_price_cents}
                locale={moneyLocale}
                className="block text-lg font-semibold text-[var(--status-success)]"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <StatusTimeline status={job.status} />

        <BeforeAfterGallery before={before} after={after} />

        {/* Action surface — only rendered for participants with something to do.
            Admins viewing the job see no action controls. */}
        {!isAdmin && (
          <ActionBar
            jobId={job.id}
            status={job.status}
            isPro={isAssignedPro}
            isHomeowner={isHomeowner}
            hasReview={hasReview}
          />
        )}
      </div>
    </main>
  );
}
