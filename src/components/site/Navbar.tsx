'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Snowflake } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileNav } from './MobileNav';

/**
 * Sticky top navigation with a hairline bottom border that intensifies once
 * the page is scrolled. Desktop shows anchor links + locale switcher + login
 * + a warm-red CTA; mobile collapses to a hamburger sheet. All tap targets
 * are >= 44px tall.
 */
export function Navbar() {
  const t = useTranslations('Nav');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Anchor links target landing sections by id (see page.tsx).
  const links = [
    { href: '#services', label: t('services') },
    { href: '#how-it-works', label: t('howItWorks') },
    { href: '#pricing', label: t('pricing') }
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors duration-300',
        scrolled
          ? 'border-border bg-background/80 backdrop-blur-xl'
          : 'border-transparent bg-background/40 backdrop-blur-md'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Capital Clear home"
        >
          <span className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-ember">
            <Snowflake className="size-4 text-primary-foreground" />
          </span>
          <span className="text-base font-medium tracking-tight text-foreground">
            Capital Clear
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-11 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="flex h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {t('login')}
          </Link>
          <Link
            href="/book"
            className="bg-gradient-ember flex h-11 items-center rounded-lg px-4 text-sm font-medium text-primary-foreground shadow-[0_8px_24px_-8px_rgba(226,58,44,0.6)] transition-transform hover:scale-[1.02] active:scale-100"
          >
            {t('bookSnow')}
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <LocaleSwitcher />
          <MobileNav links={links} />
        </div>
      </nav>
    </header>
  );
}
