'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileNav } from './MobileNav';

/**
 * Pill header (Higgsfield system). On the homepage it floats absolutely over
 * the full-bleed map hero (pointer-events pass through the wrapper, pills stay
 * interactive); on every other page it renders as a normal in-flow header.
 *
 * Left pill: crest logo + wordmark + mono nav links. Right cluster: tagline
 * pill, locale switcher pill, quiet "Log in" link and an accent "Book now"
 * pill. NOTE: auth is disabled — "Log in" routes to the /demo preview.
 */
export function Navbar() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const floating = pathname === '/';

  const links = [
    { href: '/how-it-works', label: t('howItWorks') },
    { href: '/pricing', label: t('pricing') },
    { href: '/about', label: t('about') },
    { href: '/become-a-pro', label: t('becomePro') },
    { href: '/contact', label: t('contact') }
  ];

  return (
    <header
      className={
        floating ? 'pointer-events-none absolute inset-x-0 top-0 z-50' : 'relative z-40'
      }
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5">
        {/* Left pill: logo + wordmark + desktop nav */}
        <div className="pointer-events-auto flex items-center rounded-full bg-[var(--cc-paper)]/90 py-1.5 pl-2 pr-4 shadow-sm backdrop-blur-sm">
          <Link href="/" aria-label="Capital Clear home" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.webp"
              alt=""
              className="h-7 w-7 mix-blend-multiply"
              width={28}
              height={28}
            />
            <span className="text-lg font-semibold tracking-tight text-[var(--cc-ink)]">
              Capital Clear
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-3 border-l border-[var(--cc-line)] pl-3 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-mono text-xs transition-colors motion-reduce:transition-none ${
                  pathname === l.href || pathname.startsWith(`${l.href}/`)
                    ? 'text-[var(--cc-accent)]'
                    : 'text-[var(--cc-ink-soft)] hover:text-[var(--cc-ink)]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right cluster: tagline pill, locale pill, log in, book now */}
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="hidden rounded-full bg-[var(--cc-paper)]/90 px-4 py-2 font-mono text-xs text-[var(--cc-ink-soft)] shadow-sm backdrop-blur-sm sm:block">
            {t('tagline')}
          </span>

          <LocaleSwitcher />

          <Link
            href="/demo"
            className="hidden rounded-full bg-[var(--cc-paper)]/90 px-4 py-2 font-mono text-xs text-[var(--cc-ink-soft)] shadow-sm backdrop-blur-sm transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none lg:block"
          >
            {t('loginSignup')}
          </Link>

          <Link
            href="/demo/book"
            className="hidden rounded-full bg-[var(--cc-accent)] px-4 py-2 text-xs font-medium text-[var(--cc-accent-ink)] shadow-sm transition-transform duration-100 hover:brightness-110 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none sm:block"
          >
            {t('bookNow')}
          </Link>

          <div className="lg:hidden">
            <MobileNav links={links} />
          </div>
        </div>
      </div>
    </header>
  );
}
