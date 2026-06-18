'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Radio } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { acceptJob } from '@/app/actions/jobs';
import { Button } from '@/components/ui/button';
import type { Job, ServiceType } from '@/types/database.types';

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

import { JobCard } from './JobCard';

// Live feed of postable jobs the pro is allowed to claim.
//
// REALTIME: on mount we open a single Supabase Realtime channel and listen to
// postgres_changes on the `jobs` table, event '*', filtered to
// `status=eq.posted`. Any insert/update/delete that touches a posted job
// (a homeowner posting, or another pro claiming one — which flips status off
// 'posted') calls router.refresh(), which re-runs the server component and
// streams a fresh `initial` list down. We debounce bursts with a short timer
// so a flurry of changes triggers one refresh. The channel is removed on
// unmount (cleanup) so we never leak subscriptions across navigations.
//
// ATOMIC ACCEPT: clicking "Accept" calls the acceptJob server action, whose
// claim is a single conditional UPDATE guarded by
// `status='posted' AND pro_id IS NULL` (a row lock — exactly one pro wins).
// We optimistically remove the card immediately. On ok we toast success and
// refresh (the job moves to the Active tab server-side). On 'alreadyTaken' we
// keep the card hidden (someone else won) and toast. On any other error we
// restore the card so the pro can retry.
export function AvailableFeed({
  initial,
  proServices,
}: {
  initial: FeedJob[];
  proServices: ServiceType[];
}) {
  const t = useTranslations('ProDashboard');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // IDs the pro has optimistically removed (accepted or lost the race).
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  // The job currently being accepted, so we can show per-card pending state.
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('pro-available-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: 'status=eq.posted',
        },
        () => {
          // Debounce: coalesce bursts of changes into one server refresh.
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            // Fresh server data supersedes our optimistic hides.
            setHiddenIds(new Set());
            router.refresh();
          }, 250);
        },
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  const visible = useMemo(
    () => initial.filter((job) => !hiddenIds.has(job.id)),
    [initial, hiddenIds],
  );

  function handleAccept(jobId: string) {
    setAcceptingId(jobId);
    // Optimistically drop the card.
    setHiddenIds((prev) => new Set(prev).add(jobId));

    startTransition(async () => {
      const result = await acceptJob(jobId);

      if (result.ok) {
        toast.success(t('acceptSuccess'));
        router.refresh();
      } else if (result.error === 'alreadyTaken') {
        // Lost the race — keep it hidden, just inform the pro.
        toast.error(t('acceptAlreadyTaken'));
      } else {
        // Genuine failure — restore the card so they can retry.
        setHiddenIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        toast.error(t('acceptError'));
      }
      setAcceptingId(null);
    });
  }

  if (visible.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-10 text-center text-sm text-muted-foreground">
        {t('availableEmpty')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('availableCount', { count: visible.length })}
        </p>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-[var(--status-success)]">
          <Radio className="size-3.5 animate-pulse" aria-hidden />
          {t('liveBadge')}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((job) => {
          const accepting = acceptingId === job.id;
          // Guard: the feed should already be service-filtered, but never show
          // an Accept button for a service this pro doesn't offer.
          const canAccept = proServices.includes(job.service_type);
          return (
            <li key={job.id}>
              <JobCard
                job={job}
                action={
                  canAccept ? (
                    <Button
                      size="sm"
                      onClick={() => handleAccept(job.id)}
                      disabled={isPending || accepting}
                      className="min-h-11 px-4"
                    >
                      {accepting ? t('accepting') : t('accept')}
                    </Button>
                  ) : null
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
