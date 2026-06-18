import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` is a Promise in next-intl v4 — await it, then validate.
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Scheduling is displayed in Ottawa local time.
    timeZone: 'America/Toronto',
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
