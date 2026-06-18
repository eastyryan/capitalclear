import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { requireRole } from '@/lib/auth/guards';

// Authed, per-request data — never statically prerender this subtree.
export const dynamic = 'force-dynamic';

// Route-group layout for homeowner-only pages (/dashboard, /book — added in
// Wave 3). Route groups in parens DON'T change the URL; this just wraps those
// pages with a server-side role guard. `requireRole` redirects to /login when
// unauthenticated and to / when the role doesn't match.

export default async function HomeownerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireRole('homeowner');

  return <>{children}</>;
}
