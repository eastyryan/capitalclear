import { getTranslations } from 'next-intl/server';

/**
 * Structured data for rich search results: LocalBusiness (snow-removal
 * service, Ottawa) + FAQPage built from the homeowner FAQ copy. Rendered as
 * JSON-LD script tags on the homepage.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://capitalclear.vercel.app';

export async function JsonLd({ locale }: { locale: string }) {
  const faq = await getTranslations({ locale, namespace: 'Faq' });
  const groups = faq.raw('groups') as { title: string; items: { q: string; a: string }[] }[];
  // Homeowner-facing questions only (first group) for the FAQ rich result.
  const items = (groups[0]?.items ?? []).slice(0, 6);

  const business = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}#business`,
    name: 'Capital Clear',
    description:
      'On-demand residential snow removal marketplace for Ottawa. Book in 60 seconds; a vetted local pro clears your driveway and you pay only after photo-verified proof.',
    url: SITE_URL,
    priceRange: '$45–$105',
    currenciesAccepted: 'CAD',
    areaServed: [
      'Ottawa',
      'Kanata',
      'Barrhaven',
      'Orléans',
      'Nepean',
      'Gloucester',
      'Stittsville'
    ].map((name) => ({ '@type': 'City', name })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ottawa',
      addressRegion: 'ON',
      addressCountry: 'CA'
    }
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
      />
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
        />
      )}
    </>
  );
}
