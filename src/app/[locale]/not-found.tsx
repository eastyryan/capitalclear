import { getTranslations } from 'next-intl/server';
import { PageHero, PrimaryCta, GhostCta } from '@/components/marketing/parts';

/**
 * Locale-scoped 404 — rendered inside the locale layout (Navbar + SnowLayer
 * already present), styled to match the immersive liquid-glass system.
 */
export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        accent={t('accent')}
        subtitle={t('subtitle')}
      >
        <PrimaryCta href="/">{t('ctaHome')}</PrimaryCta>
        <GhostCta href="/services">{t('ctaServices')}</GhostCta>
      </PageHero>
    </main>
  );
}
