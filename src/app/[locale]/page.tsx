import { setRequestLocale } from 'next-intl/server';
import { ImmersiveHero } from '@/components/immersive/Hero';
import { ImmersiveServices } from '@/components/immersive/Services';
import { Footer } from '@/components/site/Footer';

/**
 * Immersive, video-driven landing page. Full-bleed hero + services sections
 * with a liquid-glass design system; the global Navbar floats over them.
 * Motion is CSS-driven and disabled under prefers-reduced-motion; the
 * background videos fall back to static posters.
 */
export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ImmersiveHero />
      <ImmersiveServices />
      <Footer />
    </>
  );
}
