import { redirect } from '@/i18n/navigation';

/**
 * The FAQ now lives under the Contact page; forward any direct /faq hits there.
 */
export default async function FaqPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/contact#faq', locale });
}
