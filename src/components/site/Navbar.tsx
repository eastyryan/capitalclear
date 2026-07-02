'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileNav } from './MobileNav';

/**
 * Uber-style top navigation: a solid brand-blue bar. Left: heavy Archivo
 * wordmark + page links (Become a pro, Contact). Right: locale toggle, a
 * quiet "Log in" link and a white "Sign up" pill.
 *
 * NOTE: auth is disabled for now — "Log in" routes to the /demo preview of
 * the logged-in app so the utility side can be reviewed without an account.
 */
export function Navbar() {
  const t = useTranslations('Nav');

  const links = [
    { href: '/become-a-pro', label: t('becomePro') },
    { href: '/contact', label: t('contact') }
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-7 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Capital Clear home"
          className="font-heading text-2xl font-extrabold leading-none tracking-[-0.02em] text-white"
        >
          Capital Clear
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/85 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-5 lg:flex">
          <LocaleSwitcher onBrand />
          <Link href="/demo" className="text-sm font-medium text-white/85 hover:text-white">
            {t('login')}
          </Link>
          <Link
            href="/book"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold leading-none text-primary transition-transform active:scale-95"
          >
            {t('register')}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher onBrand />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
