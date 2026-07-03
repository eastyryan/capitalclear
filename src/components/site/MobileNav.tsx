'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, Snowflake } from 'lucide-react';
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
 * Hamburger -> slide-in sheet for small screens. Anchor links scroll to
 * landing sections; CTAs route to the booking / pro flows. Closing the sheet
 * is handled by wrapping interactive items in <SheetClose>.
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
            className="size-11 text-white hover:bg-white/10 hover:text-white lg:hidden"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-[84%] max-w-sm gap-0 bg-background">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Snowflake className="size-4 text-primary" />
            <span className="font-mono text-sm uppercase tracking-[0.16em]">
              Capital Clear
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <SheetClose
              key={link.href}
              render={
                <Link
                  href={link.href}
                  className="flex h-11 items-center rounded-lg px-3 text-base text-foreground/90 transition-colors hover:bg-secondary hover:text-foreground"
                />
              }
            >
              {link.label}
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-border p-4">
          <LocaleSwitcher className="self-start" />
          <SheetClose
            render={
              <Link
                href="/demo"
                className="flex h-11 items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              />
            }
          >
            {t('loginSignup')}
          </SheetClose>
          <SheetClose
            render={
              <Link
                href="/demo/book"
                className="bg-gradient-ember flex h-11 items-center justify-center rounded-lg text-sm font-medium text-primary-foreground"
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
