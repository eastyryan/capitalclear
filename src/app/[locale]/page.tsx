import { setRequestLocale } from 'next-intl/server';
import { HomeSheet } from '@/components/landing/HomeSheet';

/**
 * Higgsfield-style homepage: full-bleed Ottawa map with the floating pill
 * Navbar (rendered by the locale layout) and a booking bottom sheet.
 * The old stats band / pricing tiers / premium band / closing CTA moved to
 * /pricing and /how-it-works.
 */

const OTTAWA_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d73104.68602989962!2d-75.83189422590335!3d45.372168163323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce05b25f5113af%3A0x8a6a51e131dd15ed!2sOttawa%2C%20ON!5e0!3m2!1sen!2sca!4v1783043750596!5m2!1sen!2sca';

/** Server-renderable map backdrop: instant-paint plate image under the embed. */
function MapBackdrop() {
  return (
    <div className="absolute inset-0 scale-[1.06]">
      {/* Instant-paint / no-JS fallback layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/plate-winter.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <iframe
        title="Capital Clear service area — Ottawa"
        src={OTTAWA_EMBED_SRC}
        className="absolute inset-0 h-full w-full"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
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
    <main className="relative h-dvh min-h-[560px] w-full overflow-hidden">
      <MapBackdrop />
      <HomeSheet />
    </main>
  );
}
