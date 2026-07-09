'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from './LocaleSwitcher';

type NavLink = { href: string; label: string };

/**
 * Hamburger -> slide-in paper sheet for small screens (Higgsfield system):
 * crest logo + mono wordmark header, mono link rows divided by hairlines,
 * locale switcher + Log in + accent Book now at the bottom. Closing the
 * sheet is handled by wrapping interactive items in <SheetClose>.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t('openMenu')}
            className="size-10 rounded-full bg-[var(--cc-paper)]/90 text-[var(--cc-ink)] shadow-sm backdrop-blur-sm hover:bg-[var(--cc-tint)] hover:text-[var(--cc-ink)] lg:hidden"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-[84%] max-w-sm gap-0 bg-[var(--cc-paper)]">
        <SheetHeader className="border-b border-[var(--cc-line)]">
          <SheetTitle className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.webp"
              alt=""
              className="h-6 w-6 mix-blend-multiply"
              width={24}
              height={24}
            />
            <span className="font-mono text-sm uppercase tracking-[0.16em] text-[var(--cc-ink)]">
              Capital Clear
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col px-4 py-2">
          {links.map((link) => (
            <SheetClose
              key={link.href}
              render={
                <Link
                  href={link.href}
                  className="flex h-12 items-center border-b border-[var(--cc-line)] font-mono text-sm text-[var(--cc-ink-soft)] transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none"
                />
              }
            >
              {link.label}
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-[var(--cc-line)] p-4">
          <LocaleSwitcher className="self-start" />
          <SheetClose
            render={
              <Link
                href="/demo"
                className="flex h-11 items-center justify-center rounded-lg border border-[var(--cc-line)] font-mono text-sm text-[var(--cc-ink)] transition-colors hover:border-[var(--cc-ink-soft)] motion-reduce:transition-none"
              />
            }
          >
            {t('loginSignup')}
          </SheetClose>
          <SheetClose
            render={
              <Link
                href="/demo/book"
                className="flex h-11 items-center justify-center rounded-lg bg-[var(--cc-accent)] text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
              />
            }
          >
            {t('bookNow')}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
