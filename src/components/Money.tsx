import { cn } from '@/lib/utils';
import { formatCAD, type MoneyLocale } from '@/lib/format/money';

// Client-safe presentational component. No hooks, no 'use client' needed —
// it renders fine in both Server and Client Components. Uses tabular-nums so
// columns of prices align.
export function Money({
  cents,
  locale = 'en',
  className,
}: {
  cents: number;
  locale?: MoneyLocale;
  className?: string;
}) {
  return (
    <span className={cn('tabular-nums', className)}>
      {formatCAD(cents, locale)}
    </span>
  );
}
