import { setRequestLocale } from 'next-intl/server';
import { HomeSheet } from '@/components/landing/HomeSheet';

/**
 * Higgsfield-style homepage: full-bleed winter photo backdrop with the floating
 * pill Navbar (rendered by the locale layout) and a centered booking card.
 * The old stats band / pricing tiers / premium band / closing CTA moved to
 * /pricing and /how-it-works.
 */

/** Server-renderable photo backdrop: full-bleed winter plate image. */
function MapBackdrop() {
  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/plate-winter.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative flex h-dvh min-h-[560px] w-full items-center justify-center overflow-hidden p-4">
      <MapBackdrop />
      <HomeSheet />
    </main>
  );
}
