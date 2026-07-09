'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Money } from '@/components/Money';
import { approveCompletion } from '@/app/actions/jobs';
import type { Job, JobStatus } from '@/types/database.types';
import type { MoneyLocale } from '@/lib/format/money';

// Renders a single homeowner job as a Partners-style list row (divide-y list
// chrome lives in JobSections). Dates are always formatted in the property's
// service timezone (America/Toronto) using the active locale, so a homeowner
// reading in fr-CA sees the same wall-clock time as the pro on the ground.
const SERVICE_TZ = 'America/Toronto';

function formatScheduled(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: SERVICE_TZ,
  }).format(date);
}

// Status text treatment per the design system: done = struck-through soft ink,
// cancelled = soft ink, anything in flight = accent.
const DONE_STATUSES: JobStatus[] = ['completed'];
const INERT_STATUSES: JobStatus[] = ['cancelled', 'draft'];

function statusClass(status: JobStatus): string {
  if (DONE_STATUSES.includes(status))
    return 'text-[var(--cc-ink-soft)] line-through';
  if (INERT_STATUSES.includes(status)) return 'text-[var(--cc-ink-soft)]';
  return 'text-[var(--cc-accent)]';
}

export function JobCard({ job }: { job: Job }) {
  const t = useTranslations('HomeownerDashboard');
  const tStatus = useTranslations('JobStatus');
  const tService = useTranslations('Services');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Track our own flag alongside the transition so the button stays disabled
  // through the router.refresh() round-trip, not just the action call.
  const [submitting, setSubmitting] = useState(false);

  const scheduled = formatScheduled(job.scheduled_for, locale);
  const isAwaiting = job.status === 'awaiting_approval';
  const busy = submitting || isPending;

  function handleApprove() {
    setSubmitting(true);
    startTransition(async () => {
      const result = await approveCompletion(job.id);
      if (result.ok) {
        toast.success(t('approveSuccess'));
        router.refresh();
      } else {
        toast.error(t('approveError'));
        setSubmitting(false);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-base font-medium tracking-tight text-foreground', !job.address && 'italic text-[var(--cc-ink-soft)]')}>
          {job.address ?? t('noAddress')}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-[var(--cc-ink-soft)]">
          <span className={statusClass(job.status)}>{tStatus(job.status)}</span>
          <span aria-hidden>·</span>
          <span>{tService(job.service_type)}</span>
          {scheduled && (
            <>
              <span aria-hidden>·</span>
              <span>{scheduled}</span>
            </>
          )}
          {job.quoted_price_cents != null && (
            <>
              <span aria-hidden>·</span>
              <Money cents={job.quoted_price_cents} locale={locale as MoneyLocale} />
            </>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {isAwaiting && (
          <Button
            type="button"
            size="sm"
            onClick={handleApprove}
            disabled={busy}
            className="rounded-lg bg-[var(--cc-accent)] px-3.5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('approving')}
              </>
            ) : (
              t('approveRelease')
            )}
          </Button>
        )}
        <Link
          href={`/jobs/${job.id}`}
          className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--cc-ink-soft)] transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none"
        >
          {t('viewJob')}
          <svg
            viewBox="0 0 20 16"
            className="h-3.5 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M2 8h15" />
            <path d="M12 3l5 5-5 5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
