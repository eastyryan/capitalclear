'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_COLOR_VAR } from '@/lib/jobs/status';
import type { JobStatus } from '@/types/database.types';

// Vertical lifecycle timeline. The "happy path" is a fixed ordered list of
// statuses; the current status (and every step before it) is highlighted with
// its semantic colour. A cancelled job short-circuits the path and renders a
// single danger-coloured terminal node.

const LIFECYCLE: JobStatus[] = [
  'posted',
  'accepted',
  'en_route',
  'in_progress',
  'awaiting_approval',
  'completed',
];

const DOT_COLOR: Record<string, string> = {
  info: 'border-[var(--status-info)] bg-[var(--status-info)] text-[var(--status-info)]',
  warning:
    'border-[var(--status-warning)] bg-[var(--status-warning)] text-[var(--status-warning)]',
  violet:
    'border-[var(--status-violet)] bg-[var(--status-violet)] text-[var(--status-violet)]',
  success:
    'border-[var(--status-success)] bg-[var(--status-success)] text-[var(--status-success)]',
  danger:
    'border-[var(--status-danger)] bg-[var(--status-danger)] text-[var(--status-danger)]',
  muted: 'border-border bg-muted text-muted-foreground',
};

const TEXT_COLOR: Record<string, string> = {
  info: 'text-[var(--status-info)]',
  warning: 'text-[var(--status-warning)]',
  violet: 'text-[var(--status-violet)]',
  success: 'text-[var(--status-success)]',
  danger: 'text-[var(--status-danger)]',
  muted: 'text-muted-foreground',
};

export function StatusTimeline({ status }: { status: JobStatus }) {
  const tStatus = useTranslations('JobStatus');
  const tDetail = useTranslations('JobDetail');

  const isCancelled = status === 'cancelled';
  // For terminal-cancelled jobs we still show where in the path it stopped via
  // the ordered list, then a final danger node. For draft jobs (not normally
  // viewable here) clamp the index to -1 so nothing is marked complete.
  const currentIndex = LIFECYCLE.indexOf(status);

  return (
    <section aria-label={tDetail('timeline')} className="rounded-xl border bg-card p-5">
      <h2 className="eyebrow mb-4 text-muted-foreground">{tDetail('timeline')}</h2>
      <ol className="relative flex flex-col gap-0">
        {LIFECYCLE.map((step, i) => {
          const reached = !isCancelled && currentIndex >= i;
          const isCurrent = !isCancelled && currentIndex === i;
          const color = reached ? STATUS_COLOR_VAR[step] : 'muted';
          const isLast = i === LIFECYCLE.length - 1 && !isCancelled;

          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    reached
                      ? DOT_COLOR[color]
                      : 'border-border bg-background text-transparent',
                  )}
                  aria-hidden
                >
                  {reached ? (
                    <Check className="size-3.5 text-background" strokeWidth={3} />
                  ) : (
                    <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                  )}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      'w-0.5 grow',
                      reached && currentIndex > i
                        ? 'bg-[var(--status-success)]/40'
                        : 'bg-border',
                    )}
                    style={{ minHeight: '1.5rem' }}
                    aria-hidden
                  />
                )}
              </div>
              <span
                className={cn(
                  'pb-6 text-sm',
                  isCurrent
                    ? cn('font-semibold', TEXT_COLOR[color])
                    : reached
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {tStatus(step)}
              </span>
            </li>
          );
        })}

        {isCancelled && (
          <li className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                  DOT_COLOR.danger,
                )}
                aria-hidden
              >
                <span className="size-2 rounded-full bg-background" />
              </span>
            </div>
            <span
              className={cn('pb-1 text-sm font-semibold', TEXT_COLOR.danger)}
              aria-current="step"
            >
              {tStatus('cancelled')}
            </span>
          </li>
        )}
      </ol>
    </section>
  );
}
