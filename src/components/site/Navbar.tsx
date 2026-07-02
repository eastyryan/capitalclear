'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileNav } from './MobileNav';

/**
 * Uber-style top navigation: a solid brand-blue bar with a heavy Archivo
 * wordmark, plain white links, the locale pill, a quiet "Log in" link and a
 * white "Sign up" pill (Azure `.nav` / `.nav__pill` pattern).
 */
export function Navbar() {
  const t = useTranslations('Nav');

  const links = [
    { href: '/services', label: t('services') },
    { href: '/pricing', label: t('pricing') },
    { href: '/how-it-works', label: t('howItWorks') },
    { href: '/become-a-pro', label: t('becomePro') }
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Capital Clear home"
          className="font-heading text-2xl font-extrabold leading-none tracking-[-0.02em] text-white"
        >
          Capital Clear
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/85 transition-opacity hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-4 lg:flex">
          <LocaleSwitcher className="border-white/40 bg-white" />
          <Link
            href="/contact"
            className="text-sm font-medium text-white/85 transition-opacity hover:text-white"
          >
            {t('contact')}
          </Link>
          <Link href="/login" className="text-sm font-medium text-white/85 hover:text-white">
            {t('login')}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary transition-transform active:scale-95"
          >
            {t('register')}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher className="border-white/40 bg-white" />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
