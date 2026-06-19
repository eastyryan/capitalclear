'use client';

import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileNav } from './MobileNav';

/**
 * Floating, fixed liquid-glass navigation: the Ottawa crest badge (left), a
 * glass pill of links + CTA (desktop centre/right), and the locale switcher.
 * Fixed so the landing hero/services video sit full-bleed behind it.
 */
export function Navbar() {
  const t = useTranslations('Nav');

  const links = [
    { href: '#services', label: t('services') },
    { href: '#how-it-works', label: t('howItWorks') },
    { href: '#pricing', label: t('pricing') }
  ];

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Capital Clear home"
          className="block size-12 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-white/25"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-crest.png" alt="Capital Clear" className="h-full w-full object-cover" />
        </Link>

        <nav className="liquid-glass hidden items-center gap-0.5 rounded-full px-1.5 py-1.5 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 font-barlow text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-full px-3 py-2 font-barlow text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            {t('login')}
          </Link>
          <Link
            href="/book"
            className="bg-gradient-ember ml-1 inline-flex items-center gap-1 rounded-full px-4 py-2 font-barlow text-sm font-semibold text-white"
          >
            {t('bookSnow')} <ArrowUpRight className="size-4" />
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <div className="lg:hidden">
            <MobileNav links={links} />
          </div>
        </div>
      </div>
    </header>
  );
}
