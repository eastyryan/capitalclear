import type { Scope } from "../../lib/capital/data";
import { SCOPES, SERVICES, estimate } from "../../lib/capital/data";
import { ArrowRight, CCIcon } from "./glyphs";

/**
 * The merged request screen: location + service + size + live price in one
 * sheet, with a sticky meter-bar CTA. Mobile-first: every control is at
 * least 44px tall and the CTA sits in thumb reach above the safe area.
 */
export function RequestSheet({
  address,
  onAddress,
  pinSet,
  serviceId,
  onSelect,
  scope,
  onScope,
  onSubmit,
}: {
  address: string;
  onAddress: (v: string) => void;
  pinSet: boolean;
  serviceId: string;
  onSelect: (id: string) => void;
  scope: Scope;
  onScope: (s: Scope) => void;
  onSubmit: () => void;
}) {
  const services = SERVICES.winter;
  const selected = services.find((s) => s.id === serviceId) ?? services[0];
  const price = estimate(selected, scope);
  const hasLocation = pinSet || address.trim().length > 0;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 mx-auto flex max-h-[76dvh] w-full max-w-xl flex-col rounded-t-xl bg-[var(--cc-paper)] shadow-2xl">
      <div className="overflow-y-auto px-5 pt-4 sm:px-7 sm:pt-5">
        {/* The 1-2-3 guide */}
        <p className="font-[family-name:var(--cc-font-mono)] text-[11px] leading-relaxed text-[var(--cc-ink-soft)]">
          <span className="text-[var(--cc-accent)]">1</span> Drop your pin{"  "}
          <span aria-hidden className="px-1 opacity-50">·</span>
          <span className="text-[var(--cc-accent)]">2</span> We match a crew
          <span aria-hidden className="px-1 opacity-50">·</span>
          <span className="text-[var(--cc-accent)]">3</span> Track them live
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-4xl">
          Your driveway, cleared.
        </h1>

        {/* Location */}
        <label
          htmlFor="cc-address"
          className="mt-4 block font-[family-name:var(--cc-font-mono)] text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]"
        >
          Service address
        </label>
        <input
          id="cc-address"
          value={address}
          onChange={(e) => onAddress(e.target.value)}
          placeholder="41 Birchwood Lane"
          autoComplete="off"
          className="mt-1.5 h-12 w-full rounded-lg border border-[var(--cc-line)] bg-white/70 px-3 text-base outline-none transition-shadow focus:shadow-[0_0_0_2px_var(--cc-accent)]"
        />
        <p className="mt-1.5 text-xs text-[var(--cc-ink-soft)]" aria-live="polite">
          {pinSet ? (
            <span className="text-[var(--cc-accent)]">Pin set. We know where to go.</span>
          ) : (
            "Or tap your driveway on the map above."
          )}
        </p>

        {/* Service cards */}
        <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Service">
          {services.map((s) => {
            const active = s.id === selected.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(s.id)}
                className={`flex min-h-[64px] items-center gap-3 rounded-lg border p-3 text-left transition-colors duration-150 motion-reduce:transition-none ${active ? "border-[var(--cc-accent)] bg-[var(--cc-tint)]" : "border-[var(--cc-line)] hover:border-[var(--cc-ink-soft)]"}`}
              >
                <CCIcon name={s.icon} className="h-10 w-10 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium tracking-tight">{s.name}</span>
                  <span className="block truncate text-xs text-[var(--cc-ink-soft)]">
                    {s.blurb}
                  </span>
                </span>
                <span className="font-[family-name:var(--cc-font-mono)] text-base">
                  ${estimate(s, scope)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Size */}
        <div className="mt-4 flex items-center gap-2 pb-4">
          <span className="mr-1 font-[family-name:var(--cc-font-mono)] text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
            Driveway size
          </span>
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onScope(s.id)}
              aria-pressed={scope === s.id}
              className={`h-11 rounded-lg border px-4 text-sm transition-colors duration-150 motion-reduce:transition-none ${scope === s.id ? "border-[var(--cc-accent)] bg-[var(--cc-accent)] text-[var(--cc-accent-ink)]" : "border-[var(--cc-line)] text-[var(--cc-ink-soft)] hover:text-[var(--cc-ink)]"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky meter-bar CTA */}
      <div className="border-t border-[var(--cc-line)] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
        {!hasLocation && (
          <p className="pb-2 text-center text-xs text-[var(--cc-ink-soft)]">
            Add your address or tap the map to get started.
          </p>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!hasLocation}
          className={`group flex h-14 w-full items-center justify-between rounded-lg px-5 transition-[filter] duration-150 motion-reduce:transition-none ${hasLocation ? "bg-[var(--cc-accent)] text-[var(--cc-accent-ink)] hover:brightness-110 active:scale-[0.99]" : "cursor-not-allowed bg-[var(--cc-tint)] text-[var(--cc-ink-soft)]"}`}
        >
          <span className="font-[family-name:var(--cc-font-mono)] text-lg">
            ${price} <span className="text-sm opacity-80">estimate</span>
          </span>
          <span className="flex items-center gap-2 text-lg font-medium">
            See my crew
            <ArrowRight className="h-4 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </button>
      </div>
    </div>
  );
}
