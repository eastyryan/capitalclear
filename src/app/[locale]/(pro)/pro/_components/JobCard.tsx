'use client';

import type { ReactNode } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { MapPin, CalendarClock, Navigation } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Money } from '@/components/Money';
import { ServiceBadge } from '@/components/jobs/ServiceBadge';
import { StatusBadge } from '@/components/jobs/StatusBadge';
import { neighbourhoodOf } from '@/lib/geo/ottawa';
import type { Job } from '@/types/database.types';

// Presentational card for a single job in the pro dashboard. Used in every
// tab; the caller passes the trailing `action` slot (an Accept button on the
// Available feed, a "View" link on Active/Completed). Pure UI — no data
// fetching, no mutations. Scheduling is rendered in America/Toronto (the app's
// fixed timeZone, set in i18n/request.ts) and localized via next-intl.
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
  const format = useFormatter();

  // Prefer the stamped final price (completed jobs) but fall back to the quote.
  const priceCents = job.final_price_cents ?? job.quoted_price_cents ?? 0;

  return (
    <Card className="gap-3">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <ServiceBadge service={job.service_type} className="font-medium" />
          <StatusBadge status={job.status} />
        </div>

        <dl className="flex flex-col gap-2.5 text-base text-muted-foreground">
          <div className="flex items-start gap-2.5">
            <CalendarClock className="mt-1 size-5 shrink-0" aria-hidden />
            <div>
              <dt className="sr-only">{t('scheduledFor')}</dt>
              <dd className="text-foreground">
                {job.scheduled_for
                  ? format.dateTime(new Date(job.scheduled_for), {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : t('scheduleTbd')}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="mt-1 size-5 shrink-0" aria-hidden />
            <div>
              <dt className="sr-only">{t('distance')}</dt>
              <dd className="text-foreground">
                {job.address ?? job.postal_code}
              </dd>
              {job.address ? (
                <dd className="font-mono text-sm uppercase">
                  {job.postal_code}
                </dd>
              ) : null}
            </div>
          </div>

          {/* Neighbourhood derived from the postal code's FSA. */}
          <div className="flex items-center gap-2.5">
            <Navigation className="size-5 shrink-0" aria-hidden />
            <dt className="sr-only">{t('distance')}</dt>
            <dd className="font-medium text-primary">
              {neighbourhoodOf(job.postal_code) ?? t('distancePlaceholder')}
            </dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3">
        <Money
          cents={priceCents}
          className="font-mono text-xl font-semibold text-foreground"
        />
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardFooter>
    </Card>
  );
}
