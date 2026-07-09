'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { BadgeCheck, ShieldOff, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { setProVerified } from '@/app/actions/admin';
import type { UserRole } from '@/types/database.types';

// Users / pros roster with per-pro verify toggle. Client component because the
// toggle calls a server action and reflects optimistic + pending state, then
// refreshes the server tree via router.refresh() so the dashboard re-reads.

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  isPro: boolean;
  verified: boolean | null;
};

type UsersTableProps = {
  users: AdminUserRow[];
  locale: 'en' | 'fr';
};

const ROLE_VARIANT: Record<
  UserRole,
  'default' | 'secondary' | 'outline'
> = {
  admin: 'default',
  pro: 'secondary',
  homeowner: 'outline',
};

function fmtDate(iso: string, locale: 'en' | 'fr'): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

function VerifyButton({
  userId,
  verified,
}: {
  userId: string;
  verified: boolean;
}) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onToggle() {
    const next = !verified;
    startTransition(async () => {
      const result = await setProVerified(userId, next);
      if (result.ok) {
        toast.success(next ? t('verifiedToast') : t('unverifiedToast'));
        router.refresh();
      } else {
        toast.error(t('genericError'));
      }
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={verified ? 'outline' : 'default'}
      onClick={onToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : verified ? (
        <ShieldOff />
      ) : (
        <BadgeCheck />
      )}
      {isPending
        ? t('verifying')
        : verified
          ? t('unverify')
          : t('verifyPro')}
    </Button>
  );
}

function VerifiedBadge() {
  const t = useTranslations('Admin');
  return (
    <Badge
      variant="outline"
      className="border-[var(--status-success)]/30 text-[var(--status-success)]"
    >
      <BadgeCheck className="size-3" />
      {t('verified')}
    </Badge>
  );
}

export function UsersTable({ users, locale }: UsersTableProps) {
  const t = useTranslations('Admin');

  if (users.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t('emptyUsers')}
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex flex-col gap-2 rounded-lg border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-medium">
                  {u.full_name ?? t('noName')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {u.email ?? t('noEmail')}
                </span>
              </div>
              <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                {fmtDate(u.created_at, locale)}
              </span>
              {u.isPro && u.verified ? <VerifiedBadge /> : null}
            </div>
            {u.isPro ? (
              <VerifyButton userId={u.id} verified={!!u.verified} />
            ) : null}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('colName')}</TableHead>
              <TableHead>{t('colEmail')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('verified')}</TableHead>
              <TableHead>{t('created')}</TableHead>
              <TableHead className="text-right">{t('colActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.full_name ?? t('noName')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.email ?? t('noEmail')}
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  {u.isPro && u.verified ? (
                    <VerifiedBadge />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {fmtDate(u.created_at, locale)}
                </TableCell>
                <TableCell className="text-right">
                  {u.isPro ? (
                    <VerifyButton userId={u.id} verified={!!u.verified} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
