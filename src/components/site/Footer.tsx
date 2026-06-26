import { getTranslations } from 'next-intl/server';
import { Snowflake } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/**
 * Site footer — server component. Brand, tagline, service-area list, and a
 * small link column. Sits on the warm-dark band with a hairline top border.
 */
export async function Footer() {
  const t = await getTranslations('Footer');
  const year = new Date().getFullYear();
  const areas = t('areasList')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* Brand + tagline + service area */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-ember">
              <Snowflake className="size-4 text-primary-foreground" />
            </span>
            <span className="text-base font-medium tracking-tight text-foreground">
              Capital Clear
            </span>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">{t('tagline')}</p>
          <div className="space-y-2 pt-2">
            <p className="eyebrow">{t('serviceAreaTitle')}</p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
              {areas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company links */}
        <nav className="space-y-3">
          <p className="eyebrow">{t('companyTitle')}</p>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/services', label: t('linkServices') },
              { href: '/how-it-works', label: t('linkHowItWorks') },
              { href: '/pricing', label: t('linkPricing') },
              { href: '/book', label: t('linkBook') },
              { href: '/register?role=pro', label: t('linkPro') }
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Support links */}
        <nav className="space-y-3">
          <p className="eyebrow">{t('supportTitle')}</p>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/about', label: t('linkAbout') },
              { href: '/faq', label: t('linkFaq') },
              { href: '/contact', label: t('linkContact') }
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal links */}
        <nav className="space-y-3">
          <p className="eyebrow">{t('legalTitle')}</p>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/terms', label: t('linkTerms') },
              { href: '/privacy', label: t('linkPrivacy') }
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p className="font-mono uppercase tracking-[0.16em]">Capital Clear</p>
          <p>
            &copy; {year} Capital Clear. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
