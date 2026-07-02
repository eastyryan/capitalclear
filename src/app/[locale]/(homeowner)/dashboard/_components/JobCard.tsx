'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, MapPin, CalendarClock, ArrowRight } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Money } from '@/components/Money';
import { StatusBadge } from '@/components/jobs/StatusBadge';
import { ServiceBadge } from '@/components/jobs/ServiceBadge';
import { approveCompletion } from '@/app/actions/jobs';
import type { Job } from '@/types/database.types';
import type { MoneyLocale } from '@/lib/format/money';

// Renders a single homeowner job. Dates are always formatted in the property's
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

export function JobCard({ job }: { job: Job }) {
  const t = useTranslations('HomeownerDashboard');
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
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <ServiceBadge service={job.service_type} />
          <StatusBadge status={job.status} />
        </div>

        <dl className="flex flex-col gap-2.5 text-base">
          {scheduled && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <CalendarClock className="size-5 shrink-0" aria-hidden />
              <dt className="sr-only">{t('scheduledFor')}</dt>
              <dd>{scheduled}</dd>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <MapPin className="size-5 shrink-0" aria-hidden />
            <dt className="sr-only">{t('status')}</dt>
            <dd className={job.address ? '' : 'italic'}>
              {job.address ?? t('noAddress')}
            </dd>
          </div>
        </dl>

        {job.quoted_price_cents != null && (
          <Money
            cents={job.quoted_price_cents}
            locale={locale as MoneyLocale}
            className="font-mono text-xl font-semibold text-foreground"
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {isAwaiting && (
          <Button
            type="button"
            onClick={handleApprove}
            disabled={busy}
            className="min-h-11 w-full"
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
          className={cn(
            buttonVariants({
              variant: isAwaiting ? 'outline' : 'secondary',
            }),
            'min-h-11 w-full',
          )}
        >
          {t('viewJob')}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
