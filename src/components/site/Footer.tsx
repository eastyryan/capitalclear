import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/**
 * Minimal footer (Higgsfield system) — server component. Flat on paper:
 * logo + wordmark left, one wrapping row of mono links in the middle
 * (site pages + legal), mono copyright / service-area note on the right.
 */
export async function Footer() {
  const t = await getTranslations('Footer');
  const nav = await getTranslations('Nav');
  const year = new Date().getFullYear();
  const areas = t('areasList')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  const links: { href: string; label: string }[] = [
    { href: '/how-it-works', label: t('linkHowItWorks') },
    { href: '/pricing', label: t('linkPricing') },
    { href: '/about', label: t('linkAbout') },
    { href: '/book', label: t('linkBook') },
    { href: '/become-a-pro', label: t('linkPro') },
    { href: '/contact', label: t('linkContact') },
    { href: '/demo', label: nav('login') },
    { href: '/terms', label: t('linkTerms') },
    { href: '/privacy', label: t('linkPrivacy') }
  ];

  return (
    <footer className="border-t border-[var(--cc-line)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-8">
        <Link href="/" aria-label="Capital Clear home" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.webp"
            alt=""
            className="h-6 w-6 mix-blend-multiply"
            width={24}
            height={24}
          />
          <span className="font-semibold tracking-tight text-[var(--cc-ink)]">
            Capital Clear
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {links.map((l) => (
            <Link
              key={`${l.href}-${l.label}`}
              href={l.href}
              className="font-mono text-xs text-[var(--cc-ink-soft)] transition-colors hover:text-[var(--cc-ink)] motion-reduce:transition-none"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="font-mono text-[11px] leading-relaxed text-[var(--cc-ink-soft)]">
          &copy; {year} Capital Clear · {t('serviceAreaTitle')}: {areas.join(' · ')}
        </p>
      </div>
    </footer>
  );
}
