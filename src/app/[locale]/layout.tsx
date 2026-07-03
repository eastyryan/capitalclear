import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Archivo, Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/site/Navbar';
import '../globals.css';

// Azure design system faces: Archivo (heavy display grotesque), Inter (body),
// JetBrains Mono (eyebrows, data, tabular stat numerals).
// `--font-sans` / `--font-geist-mono` match the @theme mapping in globals.css.
const inter = Inter({ variable: '--font-sans', subsets: ['latin'], display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap'
});
const archivo = Archivo({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://capitalclear.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Capital Clear — Ottawa Snow Removal, On Demand',
    template: '%s'
  },
  description:
    'On-demand snow removal for Ottawa driveways and walkways. Book in 60 seconds, a vetted local pro clears it, and you only pay after photo-verified proof. From $45 per visit.',
  openGraph: {
    type: 'website',
    siteName: 'Capital Clear',
    title: 'Capital Clear — Ottawa Snow Removal, On Demand',
    description:
      'Book in 60 seconds. A vetted local pro clears your driveway, and you only pay after photo-verified proof. From $45 per visit across Ottawa.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capital Clear — Ottawa Snow Removal, On Demand',
    description:
      'On-demand driveway snow clearing across Ottawa. $0 upfront — pay when the job is photo-verified.'
  }
};

export const viewport: Viewport = {
  themeColor: '#ffffff'
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
      // Light-first: the light palette lives on :root. No `dark` class.
      className={`${inter.variable} ${jetbrainsMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Navbar />
          {children}
          <Toaster richColors position="top-center" theme="light" />
        </NextIntlClientProvider>
        {/* Vercel Web Analytics — page views + booking-funnel visibility */}
        <Analytics />
      </body>
    </html>
  );
}
