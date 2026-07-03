import { redirect } from '@/i18n/navigation';

/**
 * Snow removal is the only service, so the index just forwards to its detail
 * page to keep navigation simple.
 */
export default async function ServicesIndexPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/services/snow-removal', locale });
}
