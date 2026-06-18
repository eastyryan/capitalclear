import { setRequestLocale } from 'next-intl/server';
import { IntroLoader } from '@/components/landing/IntroLoader';
import { SmoothScroll } from '@/components/landing/SmoothScroll';
import { Hero } from '@/components/landing/Hero';
import { TrustAndHow } from '@/components/landing/TrustAndHow';
import { Services } from '@/components/landing/Services';
import { Compare } from '@/components/landing/Compare';
import { Stats } from '@/components/landing/Stats';
import { FaqAndCta } from '@/components/landing/FaqAndCta';
import { Footer } from '@/components/site/Footer';

/**
 * Cinematic scrollytelling landing page. The page itself is a Server Component
 * (so it can `setRequestLocale` for static rendering); it composes Client
 * section components that own their own motion. SmoothScroll mounts Lenis +
 * GSAP ScrollTrigger once for the pinned/scrubbed sections. All motion is gated
 * on prefers-reduced-motion inside each client component, so this page renders
 * as plain, static, fully-readable sections when motion is reduced.
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
      <IntroLoader />
      <SmoothScroll>
        <main className="flex flex-1 flex-col">
          <Hero />
          <TrustAndHow />
          <Services />
          <Compare />
          <Stats />
          <FaqAndCta />
        </main>
      </SmoothScroll>
      <Footer />
    </>
  );
}
