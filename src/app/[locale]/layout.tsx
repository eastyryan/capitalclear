import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/site/Navbar';
import { SnowLayer } from '@/components/site/SnowLayer';
import '../globals.css';

// Geist Sans (display/body) + Geist Mono (eyebrows + tabular stat numerals).
// `--font-sans` / `--font-geist-mono` match the @theme mapping in globals.css.
const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Capital Clear',
  description:
    'Ottawa snow removal, lawn care, and seasonal property maintenance marketplace.'
};

export const viewport: Viewport = {
  themeColor: '#0A0708'
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
      // `dark` keeps shadcn dark-scoped utilities aligned with the dark-first
      // palette (the palette also lives on :root as a fallback).
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          {/* Persistent falling-snow canvas behind all content (-z-10). */}
          <SnowLayer />
          <Navbar />
          {children}
          <Toaster richColors position="top-center" theme="dark" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
