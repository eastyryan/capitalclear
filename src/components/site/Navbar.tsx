'use client';

import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileNav } from './MobileNav';

/**
 * Solid, light, fixed top navigation. A frosted warm-white bar with the Ottawa
 * crest + wordmark (left), a tight set of links (centre/right), the locale
 * switcher and the booking CTA. Simplified to the essentials for clarity.
 */
export function Navbar() {
  const t = useTranslations('Nav');

  const links = [
    { href: '/how-it-works', label: t('howItWorks') },
    { href: '/pricing', label: t('pricing') },
    { href: '/contact', label: t('contact') }
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Capital Clear home" className="flex items-center gap-2.5">
          <span className="block size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-crest.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="font-instrument text-2xl italic leading-none tracking-[-0.5px] text-foreground">
            Capital Clear
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 font-barlow text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-1 rounded-full px-3.5 py-2 font-barlow text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('login')}
          </Link>
          <Link
            href="/book"
            className="bg-gradient-ember ml-1 inline-flex items-center gap-1 rounded-full px-4 py-2 font-barlow text-sm font-semibold text-white shadow-sm"
          >
            {t('bookSnow')} <ArrowUpRight className="size-4" />
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher />
          <MobileNav links={links} />
        </div>
        <div className="hidden lg:block">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
