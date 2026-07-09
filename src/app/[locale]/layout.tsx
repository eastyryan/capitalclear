import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Outfit, IBM_Plex_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/site/Navbar';
import '../globals.css';

// Higgsfield design system faces: Outfit (variable — display AND body via the
// `--font-sans: var(--font-display)` alias in globals.css), IBM Plex Mono
// (nav links, eyebrows, prices, stats). Var names stay `--font-display` /
// `--font-geist-mono` so the @theme mapping + legacy classes keep working.
const outfit = Outfit({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Capital Clear',
  description:
    'Ottawa snow removal, lawn care, and seasonal property maintenance marketplace.'
};

export const viewport: Viewport = {
  themeColor: '#f4f7fa'
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  // Next.js 16: route params are async and must be awaited.
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale segment.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      // Seasonal theme switch: winter token set. Light-first, no `dark` class.
      data-season="winter"
      className={`${outfit.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Navbar />
          {children}
          <Toaster richColors position="top-center" theme="light" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
