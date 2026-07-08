import type { Provider, Season } from "../../lib/capital/data";
import { PROVIDERS, providerPrice } from "../../lib/capital/data";
import { Monogram, Star } from "./glyphs";

/**
 * Provider matching (board 3): staggered cards on an off-grid rail. The
 * choose CTA is a route-styled link: a dotted path the arrow travels along.
 */
export function ProviderRail({
  season,
  basePrice,
  searching,
  onChoose,
}: {
  season: Season;
  basePrice: number;
  searching: boolean;
  onChoose: (p: Provider) => void;
}) {
  const providers = PROVIDERS[season];

  if (searching) {
    return (
      <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[var(--cc-paper)] px-8 py-6 text-center shadow-xl">
        <p className="text-xl font-semibold tracking-tight">Finding crews near you</p>
        <p className="mt-1 font-[family-name:var(--cc-font-mono)] text-sm text-[var(--cc-ink-soft)]">
          checking availability
        </p>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 px-4 pb-4 sm:inset-auto sm:left-8 sm:top-24 sm:max-w-3xl sm:px-0 sm:pb-0">
      <h2 className="mb-4 text-3xl font-semibold tracking-tighter sm:mb-6 sm:text-4xl">
        Three crews nearby
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 sm:overflow-visible">
        {providers.map((p, i) => (
          <article
            key={p.id}
            className={`w-64 shrink-0 rounded-xl bg-[var(--cc-paper)] p-4 shadow-lg sm:w-60 ${i === 1 ? "sm:translate-y-6" : i === 2 ? "sm:translate-y-12" : ""}`}
          >
            <header className="flex items-center gap-3">
              <Monogram initials={p.monogram} className="h-10 w-10 text-[var(--cc-accent)]" />
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold tracking-tight">{p.name}</h3>
                <p className="flex items-center gap-1 font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
                  <Star className="h-3 w-3 text-[var(--cc-accent)]" />
                  {p.rating.toFixed(1)}
                  <span aria-hidden className="px-0.5">·</span>
                  {p.jobs} jobs
                </p>
              </div>
            </header>
            <img
              src={p.photo}
              alt={`${p.name} crew at work`}
              className="mt-3 aspect-[3/2] w-full rounded-lg object-cover"
              loading="lazy"
              draggable={false}
            />
            <p className="mt-3 font-[family-name:var(--cc-font-mono)] text-sm">
              {p.etaMin} min
              <span aria-hidden className="px-1.5 text-[var(--cc-line)]">|</span>$
              {providerPrice(basePrice, p)}
            </p>
            <button
              type="button"
              onClick={() => onChoose(p)}
              className="group mt-3 block w-full text-left text-sm font-medium text-[var(--cc-accent)]"
            >
              <span className="flex items-center justify-between">
                Choose provider
                <svg
                  viewBox="0 0 24 12"
                  className="h-3 w-6 transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M14 1l5 5-5 5M2 6h17" strokeLinejoin="round" />
                </svg>
              </span>
              {/* the drawn route the arrow rides */}
              <svg viewBox="0 0 232 4" className="mt-1.5 h-1 w-full" aria-hidden>
                <path
                  d="M1 2h230"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="1 6"
                  strokeLinecap="round"
                  className="opacity-50 transition-opacity duration-300 group-hover:opacity-100"
                />
              </svg>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
