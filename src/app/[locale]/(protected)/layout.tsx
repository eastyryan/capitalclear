import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { requireUser } from '@/lib/auth/guards';

// Route-group layout for pages that only require *any* authenticated user
// regardless of role (e.g. /jobs/[id], where homeowner and pro both view the
// same job). Route groups in parens DON'T change the URL. `requireUser`
// redirects to /login when there is no session.

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireUser();

  return <>{children}</>;
}
