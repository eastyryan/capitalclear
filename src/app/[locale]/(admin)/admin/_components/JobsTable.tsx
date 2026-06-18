import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Money } from '@/components/Money';
import { StatusBadge } from '@/components/jobs/StatusBadge';
import { ServiceBadge } from '@/components/jobs/ServiceBadge';
import type { MoneyLocale } from '@/lib/format/money';
import type { Job, Profile } from '@/types/database.types';

// Recent-jobs view for the admin dashboard. Pure presentation (server
// component). Joins are resolved upstream into a name lookup keyed by user id.
// Responsive: a real <table> at md+, stacked cards below md.

export type AdminJobRow = Pick<
  Job,
  | 'id'
  | 'service_type'
  | 'status'
  | 'homeowner_id'
  | 'pro_id'
  | 'final_price_cents'
  | 'quoted_price_cents'
  | 'created_at'
>;

type JobsTableProps = {
  jobs: AdminJobRow[];
  names: Record<string, Pick<Profile, 'full_name' | 'email'>>;
  locale: MoneyLocale;
};

function nameFor(
  id: string | null,
  names: JobsTableProps['names'],
  fallback: string,
): string {
  if (!id) return fallback;
  const p = names[id];
  return p?.full_name ?? p?.email ?? fallback;
}

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

export function JobsTable({ jobs, names, locale }: JobsTableProps) {
  const t = useTranslations('Admin');

  if (jobs.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t('emptyJobs')}
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {jobs.map((job) => {
          const price = job.final_price_cents ?? job.quoted_price_cents;
          return (
            <div
              key={job.id}
              className="flex flex-col gap-2 rounded-lg border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <ServiceBadge service={job.service_type} />
                <StatusBadge status={job.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-muted-foreground">
                  #{shortId(job.id)}
                </span>
                {price != null ? (
                  <Money cents={price} locale={locale} className="font-medium" />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                <span>
                  {t('colHomeowner')}:{' '}
                  {nameFor(job.homeowner_id, names, t('noName'))}
                </span>
                <span>
                  {t('colPro')}: {nameFor(job.pro_id, names, t('unassigned'))}
                </span>
                <span>{fmtDate(job.created_at, locale)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('colJob')}</TableHead>
              <TableHead>{t('colService')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('colHomeowner')}</TableHead>
              <TableHead>{t('colPro')}</TableHead>
              <TableHead className="text-right">{t('colPrice')}</TableHead>
              <TableHead>{t('created')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const price = job.final_price_cents ?? job.quoted_price_cents;
              return (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{shortId(job.id)}
                  </TableCell>
                  <TableCell>
                    <ServiceBadge service={job.service_type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell>
                    {nameFor(job.homeowner_id, names, t('noName'))}
                  </TableCell>
                  <TableCell>
                    {nameFor(job.pro_id, names, t('unassigned'))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {price != null ? (
                      <Money cents={price} locale={locale} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(job.created_at, locale)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
