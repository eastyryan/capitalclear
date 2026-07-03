import { getTranslations } from 'next-intl/server';
import { Star } from 'lucide-react';

/**
 * Homepage testimonials, Azure-styled.
 *
 * ⚠️ SAMPLE DATA — these quotes are illustrative placeholders written for the
 * preview, NOT real customer reviews. Replace with genuine reviews (and get
 * permission to use names) before marketing the site. Publishing invented
 * reviews as real ones violates Canadian advertising rules (Competition Act).
 */

const SAMPLE_REVIEWS: {
  rating: number;
  name: string;
  area: string;
  quote: { en: string; fr: string };
}[] = [
  {
    rating: 5,
    name: 'Sarah T.',
    area: 'Barrhaven',
    quote: {
      en: 'Booked at 6 a.m. after the storm — driveway was cleared with photo proof before I finished my coffee.',
      fr: "Réservé à 6 h après la tempête — l'entrée était dégagée avec preuve photo avant la fin de mon café."
    }
  },
  {
    rating: 5,
    name: 'Marc L.',
    area: 'Orléans',
    quote: {
      en: "No contract, no season fee. I only book when it actually snows and it's cleared the same morning.",
      fr: "Pas de contrat, pas de frais de saison. Je réserve seulement quand il neige et c'est dégagé le matin même."
    }
  },
  {
    rating: 4,
    name: 'Priya S.',
    area: 'Kanata',
    quote: {
      en: 'The photo verification is the best part — I approved the job from work and paid only after seeing it done.',
      fr: "La vérification photo est le meilleur atout — j'ai approuvé le travail depuis le bureau et payé seulement après l'avoir vu terminé."
    }
  }
];

export async function Testimonials({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Testimonials' });
  const lang = locale === 'fr' ? 'fr' : 'en';

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-foreground md:text-4xl">
        {t('title')}
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {SAMPLE_REVIEWS.map((r) => (
          <figure key={r.name} className="flex flex-col rounded-[20px] border border-border bg-card p-7">
            <div className="flex items-center gap-1" aria-label={`${r.rating} / 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < r.rating ? 'fill-primary text-primary' : 'text-[var(--brand-200)]'}`}
                  aria-hidden
                />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">
              “{r.quote[lang]}”
            </blockquote>
            <figcaption className="mt-5 text-sm font-semibold text-foreground">
              {r.name}
              <span className="ml-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {r.area}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
