import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // English default, French second. Both are real URL segments because of
  // localePrefix:'always' (so `/en` and `/fr` exist; `/` redirects to `/en`).
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];
