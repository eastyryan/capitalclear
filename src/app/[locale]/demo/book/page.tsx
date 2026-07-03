import { setRequestLocale } from 'next-intl/server';
import { BookingWizard } from '../../(homeowner)/book/_components/BookingWizard';
import type { DrivewaySize } from '@/lib/pricing/quote';

export default async function DemoBook({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ size?: string; walkway?: string; address?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const initialSize: DrivewaySize | null =
    sp.size === 'single' || sp.size === 'double' ? sp.size : null;

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-6 sm:pt-10">
      <p className="mb-6 rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground">
        Walk through the booking steps and live quote. The final confirm needs the real backend, so
        it won&rsquo;t submit in the demo.
      </p>
      <BookingWizard
        initialSize={initialSize}
        initialWalkway={sp.walkway === '1'}
        initialAddress={sp.address ?? ''}
      />
    </main>
  );
}
