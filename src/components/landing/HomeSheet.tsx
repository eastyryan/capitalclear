'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { AddressAutocomplete } from '@/components/site/AddressAutocomplete';
import { DRIVEWAY_BASE_CENTS, WALKWAY_ADDON_CENTS, type DrivewaySize } from '@/lib/pricing/quote';

/**
 * Homepage bottom sheet — the booking entry point floating over the full-bleed
 * Ottawa map. Forked from HeroBookingForm: same state, same pricing constants,
 * same query params carried to /demo/book. New UI: radio option cards for
 * driveway size, a walkway toggle card, and a sticky estimate/CTA bar.
 */

/** Arrow-slide SVG (spec signature interaction #3). */
function ArrowSlide() {
  return (
    <svg
      viewBox="0 0 20 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="h-4 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
    >
      <path d="M2 8h15" />
      <path d="M12 3l5 5-5 5" />
    </svg>
  );
}

export function HomeSheet() {
  const t = useTranslations('UberHome');
  const home = useTranslations('Home');
  const footer = useTranslations('Footer');
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

  // Same query-param contract as HeroBookingForm — demo/book parses
  // size / walkway=1 / address / postal.
  function book() {
    const qs = new URLSearchParams();
    if (size) qs.set('size', size);
    if (walkway) qs.set('walkway', '1');
    if (address.trim()) qs.set('address', address.trim());
    if (postal.trim()) qs.set('postal', postal.trim());
    const query = qs.toString();
    router.push(`/demo/book${query ? `?${query}` : ''}`);
  }

  const totalCents = size ? DRIVEWAY_BASE_CENTS[size] + (walkway ? WALKWAY_ADDON_CENTS : 0) : 0;
  const ready = size !== '';

  const sizeOptions: {
    key: DrivewaySize;
    icon: string;
    name: string;
    desc: string;
    cents: number;
  }[] = [
    {
      key: 'single',
      icon: 'cc-icon--shovel',
      name: t('heroForm.sizeSingle'),
      desc: home('sheetSingleDesc'),
      cents: DRIVEWAY_BASE_CENTS.single,
    },
    {
      key: 'double',
      icon: 'cc-icon--snowflake',
      name: t('heroForm.sizeDouble'),
      desc: home('sheetDoubleDesc'),
      cents: DRIVEWAY_BASE_CENTS.double,
    },
  ];

  return (
    <section
      aria-label={t('heroTitle')}
      className="relative z-10 flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-[var(--cc-paper)] shadow-2xl"
    >
      {/* Scrollable body */}
      <div className="overflow-y-auto overscroll-contain px-5 pt-4 sm:px-7 sm:pt-5">
        <p className="font-mono text-[11px] text-[var(--cc-ink-soft)]">{home('sheetSteps')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-[var(--cc-ink)] sm:text-4xl">
          {t('heroTitle')}
        </h1>

        {/* Address */}
        <label
          htmlFor="home-sheet-address"
          className="mt-5 block font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]"
        >
          {home('sheetAddressLabel')}
        </label>
        <div className="mt-1.5">
          <AddressAutocomplete
            value={address}
            onChange={setAddress}
            onSelect={({ postal: p }) => p && setPostal(p)}
            placeholder={t('heroForm.address')}
            ariaLabel={home('sheetAddressLabel')}
            fieldClassName="flex h-12 items-center gap-3 rounded-lg border border-[var(--cc-line)] bg-white/70 px-4 transition-shadow duration-150 focus-within:shadow-[0_0_0_2px_var(--cc-accent)] motion-reduce:transition-none"
            inputClassName="h-full flex-1 bg-transparent text-base text-[var(--cc-ink)] outline-none placeholder:text-[var(--cc-ink-soft)]"
            leading={<span aria-hidden="true" className="cc-icon cc-icon--pin h-6 w-6 shrink-0" />}
          />
        </div>

        {/* Driveway size — radio cards */}
        <div
          role="radiogroup"
          aria-label={t('heroForm.size')}
          className="mt-4 flex flex-col gap-2"
        >
          {sizeOptions.map((opt) => {
            const selected = size === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSize(opt.key)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors duration-150 motion-reduce:transition-none ${
                  selected
                    ? 'border-[var(--cc-accent)] bg-[var(--cc-tint)]'
                    : 'border-[var(--cc-line)] hover:border-[var(--cc-ink-soft)]'
                }`}
              >
                <span aria-hidden="true" className={`cc-icon ${opt.icon} h-10 w-10 shrink-0`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium text-[var(--cc-ink)]">
                    {opt.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--cc-ink-soft)]">
                    {opt.desc}
                  </span>
                </span>
                <span className="font-mono text-base text-[var(--cc-ink)]">
                  {money(opt.cents)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Walkway + salt toggle card */}
        <button
          type="button"
          role="checkbox"
          aria-checked={walkway}
          onClick={() => setWalkway((w) => !w)}
          className={`mt-2 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors duration-150 motion-reduce:transition-none ${
            walkway
              ? 'border-[var(--cc-accent)] bg-[var(--cc-tint)]'
              : 'border-[var(--cc-line)] hover:border-[var(--cc-ink-soft)]'
          }`}
        >
          <span aria-hidden="true" className="cc-icon cc-icon--salt h-10 w-10 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-medium text-[var(--cc-ink)]">
              {t('heroForm.walkway')}
            </span>
            <span className="block truncate text-xs text-[var(--cc-ink-soft)]">
              {home('sheetWalkwayDesc')}
            </span>
          </span>
          <span className="font-mono text-base text-[var(--cc-ink)]">
            +{money(WALKWAY_ADDON_CENTS)}
          </span>
        </button>

        {/* Legal links — the h-dvh homepage has no footer */}
        <nav className="mt-4 flex items-center gap-4 font-mono text-[11px] text-[var(--cc-ink-soft)]">
          <Link href="/terms" className="transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none">
            {footer('linkTerms')}
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none">
            {footer('linkPrivacy')}
          </Link>
          <Link href="/contact" className="transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none">
            {footer('linkContact')}
          </Link>
        </nav>

        {/* Breathing room so the last card never hides under the sticky bar */}
        <div className="h-4" aria-hidden="true" />
      </div>

      {/* Sticky estimate / CTA bar */}
      <div className="border-t border-[var(--cc-line)] px-5 pt-3 pb-safe sm:px-7">
        <p className="pb-2 text-center text-xs text-[var(--cc-ink-soft)]">
          {ready ? home('sheetHelper') : home('sheetSelectSize')}
        </p>
        <button
          type="button"
          onClick={book}
          disabled={!ready}
          className={`group flex h-14 w-full items-center justify-between rounded-lg px-5 transition-[filter,transform] duration-100 motion-reduce:transition-none ${
            ready
              ? 'bg-[var(--cc-accent)] text-[var(--cc-accent-ink)] hover:brightness-110 active:translate-y-[1px] active:scale-[0.97]'
              : 'cursor-not-allowed bg-[var(--cc-tint)] text-[var(--cc-ink-soft)]'
          }`}
        >
          <span className="font-mono text-lg">
            {ready ? home('sheetEstimate', { price: money(totalCents) }) : '—'}
          </span>
          <span className="flex items-center gap-2 text-base font-medium">
            {home('sheetCta')}
            <ArrowSlide />
          </span>
        </button>
      </div>
    </section>
  );
}
