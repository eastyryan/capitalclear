import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { requireRole } from '@/lib/auth/guards';

// Route-group layout for admin-only pages (/admin — added in Wave 3). Route
// groups in parens DON'T change the URL; this wraps those pages with a
// server-side role guard.

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireRole('admin');

  return <>{children}</>;
}
