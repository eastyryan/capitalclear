'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * EN / FR pill switcher (Geist Mono). Preserves the current path and only
 * swaps the locale segment. `usePathname` from next-intl returns the path
 * WITHOUT the locale prefix, so `router.replace(pathname, { locale })`
 * re-renders the same route under the target locale.
 */
export function LocaleSwitcher({
  className,
  onBrand = false
}: {
  className?: string;
  /** Restyles the pill for the solid brand-blue navbar. */
  onBrand?: boolean;
}) {
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === active) return;
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full p-0.5 shadow-sm backdrop-blur-sm',
        onBrand ? 'border border-white/30 bg-transparent' : 'bg-[var(--cc-paper)]/90',
        className
      )}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            disabled={isPending}
            aria-pressed={isActive}
            className={cn(
              'font-mono min-w-[2.25rem] rounded-full px-2.5 py-1 text-xs uppercase tracking-[0.12em] transition-colors motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? onBrand
                  ? 'bg-white text-primary'
                  : 'bg-[var(--cc-tint)] text-[var(--cc-accent)]'
                : onBrand
                  ? 'text-white/75 hover:text-white'
                  : 'text-[var(--cc-ink-soft)] hover:text-[var(--cc-ink)]'
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
