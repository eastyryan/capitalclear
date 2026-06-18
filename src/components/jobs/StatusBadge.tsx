'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { STATUS_COLOR_VAR } from '@/lib/jobs/status';
import type { JobStatus } from '@/types/database.types';

const COLOR_CLASS: Record<string, string> = {
  info: 'border-[var(--status-info)]/30 bg-[var(--status-info)]/15 text-[var(--status-info)]',
  warning:
    'border-[var(--status-warning)]/30 bg-[var(--status-warning)]/15 text-[var(--status-warning)]',
  violet:
    'border-[var(--status-violet)]/30 bg-[var(--status-violet)]/15 text-[var(--status-violet)]',
  success:
    'border-[var(--status-success)]/30 bg-[var(--status-success)]/15 text-[var(--status-success)]',
  danger:
    'border-[var(--status-danger)]/30 bg-[var(--status-danger)]/15 text-[var(--status-danger)]',
  muted: 'border-border bg-muted text-muted-foreground',
};

export function StatusBadge({
  status,
  className,
}: {
  status: JobStatus;
  className?: string;
}) {
  const t = useTranslations('JobStatus');
  const color = STATUS_COLOR_VAR[status] ?? 'muted';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-wide',
        COLOR_CLASS[color],
        className,
      )}
    >
      {t(status)}
    </span>
  );
}
