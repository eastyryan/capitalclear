import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SERVICE_AREAS } from '@/lib/areas';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://capitalclear.vercel.app';

/** Publicly linked marketing routes (locale-prefixed at render time). */
const ROUTES = ['', '/become-a-pro', '/contact', '/terms', '/privacy'];

export default function sitemap(): MetadataRoute.Sitemap {
  const areaRoutes = SERVICE_AREAS.map((a) => `/areas/${a.slug}`);
  const all = [...ROUTES, ...areaRoutes];

  return routing.locales.flatMap((locale) =>
    all.map((route) => ({
      url: `${SITE_URL}/${locale}${route}`,
      changeFrequency: route === '' ? ('weekly' as const) : ('monthly' as const),
      priority: route === '' ? 1 : route.startsWith('/areas') ? 0.8 : 0.5
    }))
  );
}
