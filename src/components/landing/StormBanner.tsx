import { getTranslations } from 'next-intl/server';
import { Snowflake } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/**
 * Storm-watch banner. Server component: checks Ottawa's 3-day snowfall
 * forecast (open-meteo — free, no API key) and, when meaningful snow is
 * coming, shows a navy alert bar above the hero: "X cm expected Thursday —
 * book ahead". Hidden entirely when no snow is forecast or the fetch fails,
 * so it costs nothing off-season. Forecast cached for an hour.
 */

const OTTAWA_FORECAST_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=45.4215&longitude=-75.6972' +
  '&daily=snowfall_sum&timezone=America%2FToronto&forecast_days=3';

/** Show the banner at or above this much forecast snow (cm) on a single day. */
const SNOW_THRESHOLD_CM = 2;

interface Forecast {
  daily?: { time?: string[]; snowfall_sum?: (number | null)[] };
}

export async function StormBanner({ locale }: { locale: string }) {
  let day: string | null = null;
  let cm = 0;
  let dayIndex = -1;

  try {
    const res = await fetch(OTTAWA_FORECAST_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Forecast;
    const days = data.daily?.time ?? [];
    const snow = data.daily?.snowfall_sum ?? [];
    for (let i = 0; i < days.length; i++) {
      const s = snow[i] ?? 0;
      if (s >= SNOW_THRESHOLD_CM) {
        day = days[i];
        cm = s;
        dayIndex = i;
        break;
      }
    }
  } catch {
    return null; // forecast unavailable — no banner
  }

  if (!day) return null;

  const t = await getTranslations({ locale, namespace: 'StormBanner' });

  const dayLabel =
    dayIndex === 0
      ? t('today')
      : dayIndex === 1
        ? t('tomorrow')
        : new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
            weekday: 'long',
            timeZone: 'America/Toronto'
          }).format(new Date(`${day}T12:00:00-05:00`));

  return (
    <div className="bg-[#0B2A4A] text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 font-medium">
          <Snowflake className="size-4 shrink-0 text-[var(--brand-300)]" aria-hidden />
          {t('message', { cm: Math.round(cm), day: dayLabel })}
        </span>
        <Link
          href="/demo/book"
          className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#0B2A4A] transition-transform active:scale-95"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
