import { setRequestLocale } from 'next-intl/server';
import { BookingWizard } from './_components/BookingWizard';

// Server entry for the booking flow. The (homeowner) route-group layout
// already enforces the homeowner role guard, so this page just sets the
// request locale and hands off to the client wizard, which holds all the
// multi-step state.

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-6 sm:pt-10">
      <BookingWizard />
    </main>
  );
}
