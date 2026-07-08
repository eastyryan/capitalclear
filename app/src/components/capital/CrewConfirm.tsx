import { useState } from "react";

import type { Provider } from "../../lib/capital/data";
import { PROVIDERS, providerPrice } from "../../lib/capital/data";
import { Monogram, Star } from "./glyphs";

/**
 * Auto-match confirmation: we pick the best crew and ask for one tap to
 * confirm. "Choose a different crew" expands the alternatives inline so
 * choice is there without forcing a comparison step.
 */
export function CrewConfirm({
  basePrice,
  searching,
  onConfirm,
  onBack,
}: {
  basePrice: number;
  searching: boolean;
  onConfirm: (p: Provider) => void;
  onBack: () => void;
}) {
  const providers = PROVIDERS.winter;
  const [pick, setPick] = useState<Provider>(providers[0]);
  const [showOthers, setShowOthers] = useState(false);
  const others = providers.filter((p) => p.id !== pick.id);

  if (searching) {
    return (
      <div className="pointer-events-auto absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[var(--cc-paper)] px-8 py-6 text-center shadow-xl">
        <p className="text-xl font-semibold tracking-tight">Finding your crew</p>
        <p className="mt-1 font-[family-name:var(--cc-font-mono)] text-sm text-[var(--cc-ink-soft)]">
          checking {providers.length} crews nearby
        </p>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 mx-auto flex max-h-[80dvh] w-full max-w-md flex-col rounded-t-xl bg-[var(--cc-paper)] shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-24 sm:-translate-x-1/2 sm:rounded-xl">
      <div className="overflow-y-auto px-5 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-baseline justify-between">
          <p className="font-[family-name:var(--cc-font-mono)] text-[11px] uppercase tracking-widest text-[var(--cc-ink-soft)]">
            Your crew
          </p>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-[var(--cc-ink-soft)] underline underline-offset-4 hover:text-[var(--cc-ink)]"
          >
            Back
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Monogram initials={pick.monogram} className="h-11 w-11 shrink-0 text-[var(--cc-accent)]" />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight">{pick.name}</h2>
            <p className="flex items-center gap-1 font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
              <Star className="h-3 w-3 text-[var(--cc-accent)]" />
              {pick.rating.toFixed(1)}
              <span aria-hidden className="px-0.5">·</span>
              {pick.jobs} jobs
            </p>
          </div>
        </div>

        <img
          src={pick.photo}
          alt={`${pick.name} crew at work`}
          className="mt-3 aspect-[3/2] w-full rounded-lg object-cover"
          draggable={false}
        />

        <p className="mt-3 font-[family-name:var(--cc-font-mono)] text-base">
          Arrives in {pick.etaMin} min
          <span aria-hidden className="px-2 text-[var(--cc-line)]">|</span>$
          {providerPrice(basePrice, pick)}
        </p>

        <button
          type="button"
          onClick={() => setShowOthers((v) => !v)}
          aria-expanded={showOthers}
          className="mt-3 min-h-[44px] text-sm text-[var(--cc-ink-soft)] underline underline-offset-4 hover:text-[var(--cc-ink)]"
        >
          {showOthers ? "Keep this crew" : "Choose a different crew"}
        </button>

        {showOthers && (
          <ul className="mb-1 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
            {others.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <Monogram initials={p.monogram} className="h-9 w-9 shrink-0 text-[var(--cc-accent)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium tracking-tight">{p.name}</p>
                  <p className="font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
                    {p.rating.toFixed(1)} · {p.etaMin} min · ${providerPrice(basePrice, p)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPick(p);
                    setShowOthers(false);
                  }}
                  className="h-10 rounded-lg border border-[var(--cc-accent)] px-3.5 text-sm font-medium text-[var(--cc-accent)] transition-colors hover:bg-[var(--cc-accent)] hover:text-[var(--cc-accent-ink)] motion-reduce:transition-none"
                >
                  Pick
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-[var(--cc-line)] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5">
        <button
          type="button"
          onClick={() => onConfirm(pick)}
          className="h-14 w-full rounded-lg bg-[var(--cc-accent)] text-lg font-medium text-[var(--cc-accent-ink)] transition-[filter] duration-150 hover:brightness-110 active:scale-[0.99] motion-reduce:transition-none"
        >
          Confirm crew
        </button>
      </div>
    </div>
  );
}
