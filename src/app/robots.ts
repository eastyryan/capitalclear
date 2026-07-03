import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://capitalclear.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep the app-preview and auth-gated surfaces out of the index.
      disallow: ['/en/demo', '/fr/demo', '/en/dashboard', '/fr/dashboard', '/en/pro', '/fr/pro', '/en/admin', '/fr/admin']
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
