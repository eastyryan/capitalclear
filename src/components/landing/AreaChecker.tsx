'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isOttawaPostal, normalizePostal, neighbourhoodOf } from '@/lib/geo/ottawa';

type Result =
  | { state: 'idle' }
  | { state: 'invalid' }
  | { state: 'covered'; neighbourhood: string | null }
  | { state: 'outside' };

/**
 * Instant service-area check: type a postal code, get covered / not-covered
 * on the spot (client-side against the Ottawa FSA list — no network call).
 * A covered result names the neighbourhood and offers the booking CTA.
 */
export function AreaChecker() {
  const t = useTranslations('AreaCheck');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<Result>({ state: 'idle' });

  function check(raw: string) {
    setValue(raw);
    const postal = normalizePostal(raw);
    if (postal.length < 3) {
      setResult({ state: 'idle' });
      return;
    }
    // Canadian postal shape: letter-digit-letter at minimum for the FSA.
    if (!/^[A-Z]\d[A-Z]/.test(postal)) {
      setResult({ state: 'invalid' });
      return;
    }
    if (isOttawaPostal(postal)) {
      setResult({ state: 'covered', neighbourhood: neighbourhoodOf(postal) });
    } else {
      setResult({ state: 'outside' });
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex h-14 items-center gap-3 rounded-xl bg-white px-4 shadow-[0_2px_10px_rgba(11,42,74,.12)] transition-shadow focus-within:shadow-[inset_0_0_0_2px_var(--color-primary),0_2px_10px_rgba(11,42,74,.12)]">
        <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
        <input
          type="text"
          value={value}
          onChange={(e) => check(e.target.value)}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          autoComplete="postal-code"
          maxLength={7}
          className="flex-1 bg-transparent text-base uppercase text-foreground outline-none placeholder:normal-case placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-4 min-h-[3.5rem]" aria-live="polite">
        {result.state === 'covered' && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-base">
            <span className="inline-flex items-center gap-2 font-semibold text-[var(--status-success)]">
              <CheckCircle2 className="size-5" aria-hidden />
              {result.neighbourhood
                ? t('coveredIn', { area: result.neighbourhood })
                : t('covered')}
            </span>
            <Link
              href="/demo/book"
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)]"
            >
              {t('bookCta')}
            </Link>
          </div>
        )}
        {result.state === 'outside' && (
          <p className="flex items-center justify-center gap-2 text-base text-muted-foreground">
            <XCircle className="size-5 shrink-0 text-[var(--status-warning)]" aria-hidden />
            {t('outside')}
          </p>
        )}
        {result.state === 'invalid' && (
          <p className="text-center text-sm text-muted-foreground">{t('invalid')}</p>
        )}
      </div>
    </div>
  );
}
