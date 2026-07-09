'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types/database.types';

// Vertical lifecycle timeline. The "happy path" is a fixed ordered list of
// statuses rendered as mono step rows; every reached step gets an accent dot,
// the current step reads in accent. A cancelled job short-circuits the path
// and renders a single danger-coloured terminal node.

const LIFECYCLE: JobStatus[] = [
  'posted',
  'accepted',
  'en_route',
  'in_progress',
  'awaiting_approval',
  'completed',
];

export function StatusTimeline({ status }: { status: JobStatus }) {
  const tStatus = useTranslations('JobStatus');
  const tDetail = useTranslations('JobDetail');

  const isCancelled = status === 'cancelled';
  // For terminal-cancelled jobs we still show where in the path it stopped via
  // the ordered list, then a final danger node. For draft jobs (not normally
  // viewable here) clamp the index to -1 so nothing is marked complete.
  const currentIndex = LIFECYCLE.indexOf(status);

  return (
    <section
      aria-label={tDetail('timeline')}
      className="rounded-xl border border-[var(--cc-line)] bg-card p-5"
    >
      <h2 className="eyebrow mb-4">{tDetail('timeline')}</h2>
      <ol className="relative flex flex-col gap-0">
        {LIFECYCLE.map((step, i) => {
          const reached = !isCancelled && currentIndex >= i;
          const isCurrent = !isCancelled && currentIndex === i;
          const isLast = i === LIFECYCLE.length - 1 && !isCancelled;

          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors motion-reduce:transition-none',
                    reached
                      ? 'border-[var(--cc-accent)] bg-[var(--cc-accent)]'
                      : 'border-[var(--cc-line)] bg-background',
                  )}
                  aria-hidden
                >
                  {reached ? (
                    <Check
                      className="size-3.5 text-[var(--cc-accent-ink)]"
                      strokeWidth={3}
                    />
                  ) : (
                    <span className="size-1.5 rounded-full bg-[var(--cc-ink-soft)]/40" />
                  )}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      'w-0.5 grow',
                      reached && currentIndex > i
                        ? 'bg-[var(--cc-accent)]/40'
                        : 'bg-[var(--cc-line)]',
                    )}
                    style={{ minHeight: '1.5rem' }}
                    aria-hidden
                  />
                )}
              </div>
              <span
                className={cn(
                  'pb-6 font-mono text-xs uppercase tracking-wide leading-6',
                  isCurrent
                    ? 'font-medium text-[var(--cc-accent)]'
                    : reached
                      ? 'text-[var(--cc-ink-soft)] line-through'
                      : 'text-[var(--cc-ink-soft)]',
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
                className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--status-danger)] bg-[var(--status-danger)]"
                aria-hidden
              >
                <span className="size-2 rounded-full bg-background" />
              </span>
            </div>
            <span
              className="pb-1 font-mono text-xs font-medium uppercase tracking-wide leading-6 text-[var(--status-danger)]"
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
