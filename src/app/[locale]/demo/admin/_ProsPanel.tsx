import { getTranslations } from 'next-intl/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Money } from '@/components/Money';
import type { MoneyLocale } from '@/lib/format/money';
import {
  ADMIN_JOBS,
  ADMIN_PAYMENTS,
  ADMIN_PRO_COMPANIES,
  ADMIN_PRO_STATS,
  ADMIN_NAMES
} from '../_mock';

/**
 * Admin "Pros" tab — the by-subcontractor view. Rolls the demo jobs and
 * payments up per pro company so the operator can see which subcontractor did
 * what and what they were paid, plus a flat payments-by-subcontractor ledger.
 */

const ACTIVE_STATUSES = new Set(['accepted', 'en_route', 'in_progress', 'awaiting_approval']);

function proOfJob(jobId: string): string | null {
  return ADMIN_JOBS.find((j) => j.id === jobId)?.pro_id ?? null;
}

/** Person name without the appended company suffix. */
function contactName(proId: string): string {
  return (ADMIN_NAMES[proId]?.full_name ?? '').split('·')[0].trim();
}

export async function ProsPanel({ locale }: { locale: MoneyLocale }) {
  const t = await getTranslations('Admin');

  const rollups = Object.entries(ADMIN_PRO_COMPANIES).map(([proId, company]) => {
    const jobs = ADMIN_JOBS.filter((j) => j.pro_id === proId);
    const done = jobs.filter((j) => j.status === 'completed');
    const active = jobs.filter((j) => ACTIVE_STATUSES.has(j.status));
    const earningsCents = ADMIN_PAYMENTS.filter(
      (p) => p.status === 'released' && proOfJob(p.job_id) === proId
    ).reduce((s, p) => s + p.amount_cents, 0);
    return {
      proId,
      company,
      contact: contactName(proId),
      email: ADMIN_NAMES[proId]?.email ?? null,
      done: done.length,
      active: active.length,
      earningsCents,
      ratingAvg: ADMIN_PRO_STATS[proId]?.ratingAvg ?? null
    };
  });

  const payments = ADMIN_PAYMENTS.map((p) => {
    const proId = proOfJob(p.job_id);
    return {
      ...p,
      company: proId ? ADMIN_PRO_COMPANIES[proId] : null
    };
  }).filter((p) => p.company);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tighter text-foreground">{t('prosTitle')}</h2>
        <p className="mt-1 max-w-[52ch] text-base text-[var(--cc-ink-soft)]">{t('prosSubtitle')}</p>
        <div className="mt-4 rounded-xl border border-border bg-card p-3 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colCompany')}</TableHead>
                <TableHead>{t('colContact')}</TableHead>
                <TableHead>{t('colJobsDone')}</TableHead>
                <TableHead>{t('colActiveJobs')}</TableHead>
                <TableHead>{t('colEarnings')}</TableHead>
                <TableHead>{t('colRating')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rollups.map((r) => (
                <TableRow key={r.proId}>
                  <TableCell className="font-medium text-foreground">{r.company}</TableCell>
                  <TableCell>
                    <div>{r.contact}</div>
                    <div className="text-sm text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell className="tabular-nums">{r.done}</TableCell>
                  <TableCell className="tabular-nums">{r.active}</TableCell>
                  <TableCell>
                    <Money cents={r.earningsCents} locale={locale} className="font-mono" />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {r.ratingAvg != null ? `★ ${r.ratingAvg.toFixed(1)}` : t('unrated')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tighter text-foreground">
          {t('paymentsByProTitle')}
        </h2>
        <div className="mt-4 rounded-xl border border-border bg-card p-3 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colPayment')}</TableHead>
                <TableHead>{t('colCompany')}</TableHead>
                <TableHead>{t('colJob')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead>{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{p.company}</TableCell>
                  <TableCell className="font-mono text-sm">{p.job_id}</TableCell>
                  <TableCell>
                    <Money cents={p.amount_cents} locale={locale} className="font-mono" />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
