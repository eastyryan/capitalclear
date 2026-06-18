import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Skeleton } from '@/components/ui/skeleton';
import { RegisterForm } from './RegisterForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });
  return { title: `${t('registerTitle')} · Capital Clear` };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* RegisterForm reads ?role=pro via useSearchParams, so it needs a
            Suspense boundary in Next 16. */}
        <Suspense fallback={<Skeleton className="h-[36rem] w-full rounded-xl" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
