import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SERVICE_AREAS } from '@/lib/areas';

/**
 * Uber-style footer — server component. Deep navy-ink band with a heavy
 * Archivo wordmark, a "help" link, four link columns, then a hairline bottom
 * bar with service area + copyright.
 */
export async function Footer() {
  const t = await getTranslations('Footer');
  const nav = await getTranslations('Nav');
  const locale = await getLocale();
  const year = new Date().getFullYear();
  const lang = locale === 'fr' ? 'fr' : 'en';

  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: t('companyTitle'),
      links: [
        { href: '/book', label: t('linkBook') },
        { href: '/become-a-pro', label: t('linkPro') },
        { href: '/contact', label: t('linkContact') }
      ]
    },
    {
      title: t('supportTitle'),
      links: [
        { href: '/contact#faq', label: t('linkFaq') },
        { href: '/demo', label: nav('login') }
      ]
    },
    {
      title: t('legalTitle'),
      links: [
        { href: '/terms', label: t('linkTerms') },
        { href: '/privacy', label: t('linkPrivacy') }
      ]
    }
  ];

  return (
    <footer className="bg-[#0B2A4A] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-heading text-2xl font-extrabold tracking-[-0.02em]">
            Capital Clear
          </span>
          <Link href="/contact" className="text-sm font-medium text-white/80 hover:text-white">
            {t('linkContact')} →
          </Link>
        </div>
        <p className="mt-3 max-w-md text-sm text-white/60">{t('tagline')}</p>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {columns.map((col) => (
            <nav key={col.title} className="space-y-4">
              <p className="text-sm font-bold">{col.title}</p>
              <ul className="space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={`${l.href}-${l.label}`}>
                    <Link href={l.href} className="text-white/70 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-white/15 pt-6">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-xs uppercase tracking-[0.12em] text-white/60">
            <span>{t('serviceAreaTitle')}</span>
            {SERVICE_AREAS.map((a) => (
              <span key={a.slug}>
                {' · '}
                <Link href={`/areas/${a.slug}`} className="transition-colors hover:text-white">
                  {a.name[lang]}
                </Link>
              </span>
            ))}
          </p>
          <p className="mt-3 text-xs text-white/50">
            &copy; {year} Capital Clear. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
