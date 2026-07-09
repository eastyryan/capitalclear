'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Star } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { isCancellable } from '@/lib/jobs/status';
import {
  updateJobStatus,
  markComplete,
  approveCompletion,
  cancelJob,
} from '@/app/actions/jobs';
import { submitReview } from '@/app/actions/reviews';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhotoUploader } from './PhotoUploader';
import type { ActionResult } from '@/lib/types';
import type { JobStatus } from '@/types/database.types';

// Role + status aware action surface for a single job. Receives the role flags
// from the server page (it never re-derives identity client-side). Every action
// runs inside a transition, surfaces a sonner toast on ok/err, and calls
// router.refresh() on success so the server page re-fetches the new state.

type Props = {
  jobId: string;
  status: JobStatus;
  isPro: boolean;
  isHomeowner: boolean;
  hasReview: boolean;
};

// Maps known action error codes to a JobDetail.* translation key. Anything
// unrecognized falls through to the generic error.
const ERROR_KEY: Record<string, string> = {
  needBeforePhoto: 'needBeforePhoto',
  needAfterPhoto: 'needAfterPhoto',
  ALREADY_REVIEWED: 'reviewExists',
};

// Signature button press (design-system interaction) for solid CTAs.
const PRESS =
  'rounded-lg transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none';

export function ActionBar({
  jobId,
  status,
  isPro,
  isHomeowner,
  hasReview,
}: Props) {
  const t = useTranslations('JobDetail');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Resolve an action error to a user-facing message.
  function messageFor(error: string): string {
    const key = ERROR_KEY[error];
    return key ? t(key as Parameters<typeof t>[0]) : t('genericError');
  }

  // Shared runner: execute a server action, toast, refresh on success.
  function run(
    action: () => Promise<ActionResult<unknown>>,
    successMsg: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(messageFor(result.error));
        return;
      }
      toast.success(successMsg);
      router.refresh();
    });
  }

  // -- PRO actions ---------------------------------------------------------
  if (isPro) {
    if (status === 'accepted') {
      return (
        <ActionShell>
          <Button
            size="lg"
            className={cn('h-11 w-full', PRESS)}
            disabled={isPending}
            onClick={() =>
              run(
                () => updateJobStatus(jobId, 'en_route'),
                t('statusUpdated'),
              )
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t('startTravel')}
          </Button>
        </ActionShell>
      );
    }

    if (status === 'en_route') {
      // Starting work requires a before photo. The pro can capture one here,
      // then "Start work" — the action enforces the gate (needBeforePhoto).
      return (
        <ActionShell>
          <PhotoUploader jobId={jobId} type="before" />
          <Button
            size="lg"
            className={cn('h-11 w-full', PRESS)}
            disabled={isPending}
            onClick={() =>
              run(
                () => updateJobStatus(jobId, 'in_progress'),
                t('statusUpdated'),
              )
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t('startWork')}
          </Button>
        </ActionShell>
      );
    }

    if (status === 'in_progress') {
      // Completing requires an after photo (action enforces needAfterPhoto).
      return (
        <ActionShell>
          <PhotoUploader jobId={jobId} type="after" />
          <Button
            size="lg"
            className={cn('h-11 w-full', PRESS)}
            disabled={isPending}
            onClick={() => run(() => markComplete(jobId), t('completeSent'))}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t('markComplete')}
          </Button>
        </ActionShell>
      );
    }
  }

  // -- HOMEOWNER actions ---------------------------------------------------
  if (isHomeowner) {
    if (status === 'awaiting_approval') {
      return (
        <ActionShell>
          <Button
            size="lg"
            className={cn('h-11 w-full', PRESS)}
            disabled={isPending}
            onClick={() =>
              run(() => approveCompletion(jobId), t('paymentReleased'))
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t('approve')}
          </Button>
        </ActionShell>
      );
    }

    if (status === 'completed' && !hasReview) {
      return (
        <ActionShell>
          <ReviewForm jobId={jobId} />
        </ActionShell>
      );
    }

    if (isCancellable(status)) {
      return (
        <ActionShell>
          <Button
            variant="destructive"
            size="lg"
            className={cn('h-11 w-full', PRESS)}
            disabled={isPending}
            onClick={() => run(() => cancelJob(jobId), t('jobCancelled'))}
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t('cancelJob')}
          </Button>
        </ActionShell>
      );
    }
  }

  // Nothing actionable for this role+status.
  return null;
}

// Sticky bottom container so the primary CTA stays in thumb reach on mobile.
function ActionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-[var(--cc-line)] bg-[var(--cc-paper)]/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--cc-paper)]/80 sm:static sm:mx-0 sm:rounded-xl sm:border sm:border-[var(--cc-line)] sm:bg-card sm:p-5 sm:backdrop-blur-none">
      {children}
    </div>
  );
}

// -- Review form -----------------------------------------------------------

function ReviewForm({ jobId }: { jobId: string }) {
  const t = useTranslations('JobDetail');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  function onSubmit() {
    if (rating < 1) {
      toast.error(t('selectRating'));
      return;
    }
    startTransition(async () => {
      const result = await submitReview(jobId, rating, comment.trim() || undefined);
      if (!result.ok) {
        const message =
          result.error === 'ALREADY_REVIEWED'
            ? t('reviewExists')
            : t('genericError');
        toast.error(message);
        return;
      }
      toast.success(t('reviewSubmitted'));
      router.refresh();
    });
  }

  const active = hovered || rating;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-semibold text-foreground">
        {t('leaveReview')}
      </span>

      <div className="flex flex-col gap-2">
        <Label>{t('ratingLabel')}</Label>
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label={t('ratingLabel')}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={t('starLabel', { count: value })}
              className="rounded p-0.5 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(value)}
            >
              <Star
                className={cn(
                  'size-7',
                  value <= active
                    ? 'fill-[var(--status-warning)] text-[var(--status-warning)]'
                    : 'text-muted-foreground/40',
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('reviewPlaceholder')}
        rows={3}
        maxLength={2000}
      />

      <Button
        size="lg"
        className="h-11 w-full"
        disabled={isPending}
        onClick={onSubmit}
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {t('submitReview')}
      </Button>
    </div>
  );
}
