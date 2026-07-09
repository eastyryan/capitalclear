import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Money } from '@/components/Money';
import type { MoneyLocale } from '@/lib/format/money';
import type { Payment } from '@/types/database.types';

// Payments ledger view. Pure presentation (server component). Visibility into
// job, amount, status, and created date. Status colours mirror the payment
// lifecycle: released = success, refunded/failed = danger, authorized = info.

export type AdminPaymentRow = Pick<
  Payment,
  'id' | 'job_id' | 'amount_cents' | 'status' | 'created_at'
>;

type PaymentsTableProps = {
  payments: AdminPaymentRow[];
  locale: MoneyLocale;
};

const STATUS_CLASS: Record<Payment['status'], string> = {
  none: 'border-border text-muted-foreground',
  authorized: 'border-[var(--status-info)]/30 text-[var(--status-info)]',
  released: 'border-[var(--status-success)]/30 text-[var(--status-success)]',
  cancelled: 'border-border text-muted-foreground',
  refunded: 'border-[var(--status-warning)]/30 text-[var(--status-warning)]',
  failed: 'border-[var(--status-danger)]/30 text-[var(--status-danger)]',
};

function shortId(id: string): string {
  return id.slice(0, 8);
}

function fmtDate(iso: string, locale: MoneyLocale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

function PaymentStatusBadge({ status }: { status: Payment['status'] }) {
  const t = useTranslations('PaymentStatus');
  return (
    <Badge
      variant="outline"
      className={`font-mono text-xs uppercase tracking-wide ${STATUS_CLASS[status]}`}
    >
      {t(status)}
    </Badge>
  );
}

export function PaymentsTable({ payments, locale }: PaymentsTableProps) {
  const t = useTranslations('Admin');

  if (payments.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t('emptyPayments')}
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-2 rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {t('colJob')} #{shortId(p.job_id)}
              </span>
              <PaymentStatusBadge status={p.status} />
            </div>
            <div className="flex items-center justify-between">
              <Money
                cents={p.amount_cents}
                locale={locale}
                className="font-mono text-lg font-medium"
              />
              <span className="font-mono text-xs text-muted-foreground">
                {fmtDate(p.created_at, locale)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('colJob')}</TableHead>
              <TableHead className="text-right">{t('amount')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('created')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{shortId(p.job_id)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  <Money cents={p.amount_cents} locale={locale} />
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={p.status} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {fmtDate(p.created_at, locale)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
