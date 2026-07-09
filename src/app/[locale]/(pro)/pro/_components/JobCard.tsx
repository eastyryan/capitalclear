'use client';

import type { ReactNode } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

import { Money } from '@/components/Money';
import { ServiceBadge } from '@/components/jobs/ServiceBadge';
import { neighbourhoodOf } from '@/lib/geo/ottawa';
import { cn } from '@/lib/utils';
import type { Job, JobStatus } from '@/types/database.types';

// Presentational row for a single job in the pro dashboard ("Incoming
// requests" list style). Used in every tab; the caller passes the trailing
// `action` slot (an Accept button on the Available feed, a "View" link on
// Active/Completed) and wraps rows in a divide-y list. Pure UI — no data
// fetching, no mutations. Scheduling is rendered in America/Toronto (the
// app's fixed timeZone, set in i18n/request.ts) and localized via next-intl.

// Status text treatment: done = struck-through soft ink, in flight = accent.
function statusClass(status: JobStatus): string {
  if (status === 'completed') return 'text-[var(--cc-ink-soft)] line-through';
  if (status === 'cancelled' || status === 'draft')
    return 'text-[var(--cc-ink-soft)]';
  return 'text-[var(--cc-accent)]';
}

export function JobCard({
  job,
  action,
}: {
  job: Pick<
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
  action?: ReactNode;
}) {
  const t = useTranslations('ProDashboard');
  const tStatus = useTranslations('JobStatus');
  const format = useFormatter();

  // Prefer the stamped final price (completed jobs) but fall back to the quote.
  const priceCents = job.final_price_cents ?? job.quoted_price_cents ?? 0;

  const scheduled = job.scheduled_for
    ? format.dateTime(new Date(job.scheduled_for), {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : t('scheduleTbd');

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="truncate text-base font-medium tracking-tight text-foreground">
            {job.address ?? job.postal_code}
          </p>
          <ServiceBadge
            service={job.service_type}
            className="shrink-0 text-xs text-[var(--cc-ink-soft)]"
          />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-[var(--cc-ink-soft)]">
          <span className={statusClass(job.status)}>{tStatus(job.status)}</span>
          <span aria-hidden>·</span>
          <span>{scheduled}</span>
          {job.address ? (
            <>
              <span aria-hidden>·</span>
              <span className="uppercase">{job.postal_code}</span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          {/* Neighbourhood derived from the postal code's FSA. */}
          <span className={cn(neighbourhoodOf(job.postal_code) && 'text-foreground')}>
            {neighbourhoodOf(job.postal_code) ?? t('distancePlaceholder')}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Money
          cents={priceCents}
          className="font-mono text-base font-medium text-foreground"
        />
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
