'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Send, ChevronsUpDown } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useRouter } from '@/i18n/navigation';
import { AddressAutocomplete } from '@/components/site/AddressAutocomplete';
import { DRIVEWAY_BASE_CENTS, WALKWAY_ADDON_CENTS, type DrivewaySize } from '@/lib/pricing/quote';

/**
 * Uber-style hero request module, but functional: the homeowner enters an
 * address, picks a driveway size, and optionally adds a walkway. "See prices"
 * carries those values to the booking flow (as query params) and lands on the
 * steps, where the quote — plus Ontario HST — is shown.
 */
export function HeroBookingForm() {
  const t = useTranslations('UberHome');
  const locale = useLocale();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [postal, setPostal] = useState('');
  const [size, setSize] = useState<DrivewaySize | ''>('');
  const [walkway, setWalkway] = useState(false);

  const money = (cents: number) =>
    new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(cents / 100);

  function seePrices() {
    // Funnel event: hero form → booking flow (no PII).
    track('hero_continue_booking', { size: size || 'unset', walkway });
    const qs = new URLSearchParams();
    if (size) qs.set('size', size);
    if (walkway) qs.set('walkway', '1');
    if (address.trim()) qs.set('address', address.trim());
    if (postal.trim()) qs.set('postal', postal.trim());
    const query = qs.toString();
    router.push(`/demo/book${query ? `?${query}` : ''}`);
  }

  return (
    <div className="mt-9 flex max-w-md flex-col gap-3">
      {/* Address — type-ahead autocomplete */}
      <AddressAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={({ postal: p }) => p && setPostal(p)}
        placeholder={t('heroForm.address')}
        ariaLabel={t('heroForm.address')}
        fieldClassName="flex h-14 items-center gap-3 rounded-xl bg-[var(--brand-50)] px-4 transition-shadow focus-within:shadow-[inset_0_0_0_2px_var(--color-primary)]"
        inputClassName="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-foreground"
        trailing={<Send className="size-5 shrink-0 text-primary" aria-hidden />}
      />

      {/* Driveway size */}
      <div className="flex h-14 items-center gap-3 rounded-xl bg-[var(--brand-50)] px-4 transition-shadow focus-within:shadow-[inset_0_0_0_2px_var(--color-primary)]">
        <select
          value={size}
          onChange={(e) => setSize(e.target.value as DrivewaySize | '')}
          aria-label={t('heroForm.size')}
          className="flex-1 appearance-none bg-transparent text-base text-foreground outline-none"
        >
          <option value="" disabled>
            {t('heroForm.size')}
          </option>
          <option value="single">
            {t('heroForm.sizeSingle')} — {money(DRIVEWAY_BASE_CENTS.single)}
          </option>
          <option value="double">
            {t('heroForm.sizeDouble')} — {money(DRIVEWAY_BASE_CENTS.double)}
          </option>
        </select>
        <ChevronsUpDown className="size-5 shrink-0 text-primary" aria-hidden />
      </div>

      {/* Walkway add-on — label + faded price inline; selection circle at right */}
      <button
        type="button"
        role="checkbox"
        aria-checked={walkway}
        onClick={() => setWalkway((w) => !w)}
        className={`flex h-14 items-center gap-3 rounded-xl border px-4 text-left transition-colors ${
          walkway ? 'border-primary bg-primary/10' : 'border-transparent bg-[var(--brand-50)] hover:bg-[var(--brand-100)]'
        }`}
      >
        <span className="flex-1 text-base text-foreground">
          {t('heroForm.walkway')}{' '}
          <span className="font-mono text-sm text-muted-foreground">
            +{money(WALKWAY_ADDON_CENTS)}
          </span>
        </span>
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border border-primary ${
            walkway ? 'bg-primary text-primary-foreground' : 'bg-transparent'
          }`}
          aria-hidden
        >
          {walkway && (
            <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12l5 5L20 6" />
            </svg>
          )}
        </span>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={seePrices}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-medium leading-none text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-[var(--primary-hover)] active:scale-[0.98] active:bg-[var(--primary-pressed)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          {t('heroForm.seePrices')}
        </button>
      </div>
    </div>
  );
}
