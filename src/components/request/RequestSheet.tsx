import {
  ADDONS,
  SCOPES,
  SEASON_COPY,
  SERVICES,
  priceFor,
  quoteFor,
  type AddonId,
  type ScopeId,
} from "../../lib/data"
import { AREAS, NO_AREA } from "../../lib/areas"
import { useSeason } from "../../lib/season"
import { formatPostal, isValidPostalFormat } from "../../lib/postal"
import Icon from "../Icon"

export default function RequestSheet({
  address,
  onAddress,
  postal,
  onPostal,
  area,
  onArea,
  contact,
  onContact,
  hasPin,
  serviceId,
  onService,
  scope,
  onScope,
  addons,
  onToggleAddon,
  onSubmit,
}: {
  address: string
  onAddress: (v: string) => void
  postal: string
  onPostal: (v: string) => void
  area: string
  onArea: (v: string) => void
  contact: string
  onContact: (v: string) => void
  hasPin: boolean
  serviceId: string
  onService: (id: string) => void
  scope: ScopeId
  onScope: (s: ScopeId) => void
  addons: AddonId[]
  onToggleAddon: (id: AddonId) => void
  onSubmit: () => void
}) {
  const { season } = useSeason()
  const services = SERVICES[season]
  const copy = SEASON_COPY[season]
  const service = services.find((s) => s.id === serviceId) ?? services[0]
  const extras = ADDONS[season]
  const price = quoteFor(service, scope, season, addons)
  const postalOk = postal.trim().length === 0 || isValidPostalFormat(postal)
  const located = hasPin || address.trim().length > 0

  return (
    <div
      className="cc-sheet-in absolute inset-x-0 bottom-0 z-20 mx-auto flex max-h-[76dvh] w-full max-w-xl flex-col rounded-t-3xl bg-paper/95 shadow-[0_-20px_60px_-30px_rgb(24_32_42/0.5)] ring-1 ring-line backdrop-blur-md sm:bottom-6 sm:rounded-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="overflow-y-auto px-6 pt-6 pb-3 sm:px-8">
        <p className="font-mono text-[12px] text-ink-soft">
          <span className="text-accent">1</span> Drop your pin{" "}
          <span className="mx-1">·</span> <span className="text-accent">2</span>{" "}
          We match a crew <span className="mx-1">·</span>{" "}
          <span className="text-accent">3</span> Track them live
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-[2.75rem]">
          {copy.headline}
        </h1>

        <label
          htmlFor="address"
          className="mt-6 block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
        >
          Service address
        </label>
        <input
          id="address"
          value={address}
          onChange={(e) => onAddress(e.target.value)}
          placeholder="41 Birchwood Lane"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-lg outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
        />
        <p className={`mt-2 text-sm ${hasPin ? "font-semibold text-accent" : "text-ink-soft"}`}>
          {hasPin ? "Pin set. We know where to go." : copy.tapHint}
        </p>

        <label
          htmlFor="postal"
          className="mt-4 block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
        >
          Postal code
        </label>
        <input
          id="postal"
          value={postal}
          onChange={(e) => onPostal(e.target.value)}
          onBlur={() => postal.trim() && onPostal(formatPostal(postal))}
          placeholder="K2K 2X8"
          autoComplete="postal-code"
          inputMode="text"
          maxLength={7}
          aria-invalid={!postalOk}
          className={`mt-2 w-full rounded-xl border bg-white px-4 py-3.5 text-lg uppercase outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent ${
            postalOk ? "border-line" : "border-red-400"
          }`}
        />
        <p className={`mt-2 text-sm ${postalOk ? "text-ink-soft" : "font-semibold text-red-500"}`}>
          {postalOk
            ? "This routes your request to the crews covering your neighbourhood."
            : "Enter a valid Canadian postal code (e.g. K2K 2X8)."}
        </p>

        <label
          htmlFor="area"
          className="mt-4 block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
        >
          Neighborhood
        </label>
        <select
          id="area"
          value={area}
          onChange={(e) => onArea(e.target.value)}
          className="mt-2 w-full appearance-none rounded-xl border border-line bg-white px-4 py-3.5 text-base outline-none transition-colors focus:border-accent"
        >
          <option value="">{NO_AREA}</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <label
          htmlFor="contact"
          className="mt-4 block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
        >
          Phone or email (optional)
        </label>
        <input
          id="contact"
          value={contact}
          onChange={(e) => onContact(e.target.value)}
          placeholder="So your crew can reach you"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
        />

        <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Service">
          {services.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={s.id === serviceId}
              onClick={() => onService(s.id)}
              className={`flex min-h-[44px] w-full items-center gap-3.5 rounded-2xl border bg-white px-4 py-3.5 text-left transition-all duration-200 ${
                s.id === serviceId
                  ? "border-accent bg-tint/60 shadow-[0_10px_30px_-18px_rgb(43_95_184/0.6)]"
                  : "border-line hover:border-ink/40"
              }`}
            >
              <Icon id={s.icon} size={36} />
              <span className="flex-1">
                <span className="block font-bold">{s.name}</span>
                <span className="block text-[13px] text-ink-soft">{s.blurb}</span>
              </span>
              <span className="font-mono text-lg">${priceFor(s, scope)}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase">
            {copy.sizeLabel}
          </span>
          <div className="flex gap-2" role="radiogroup" aria-label={copy.sizeLabel}>
            {SCOPES.map((sc) => (
              <button
                key={sc.id}
                role="radio"
                aria-checked={sc.id === scope}
                onClick={() => onScope(sc.id)}
                className={`min-h-[36px] rounded-full border px-4 text-sm font-semibold transition-colors ${
                  sc.id === scope
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-line bg-white text-ink-soft hover:border-ink/40"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {extras.length > 0 && (
          <div className="mt-5">
            <p className="font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase">
              Add-ons
            </p>
            <div className="mt-2.5 space-y-2.5">
              {extras.map((a) => {
                const on = addons.includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => onToggleAddon(a.id)}
                    className={`flex min-h-[44px] w-full items-center gap-3.5 rounded-2xl border bg-white px-4 py-3.5 text-left transition-all duration-200 ${
                      on
                        ? "border-accent bg-tint/60 shadow-[0_10px_30px_-18px_rgb(43_95_184/0.6)]"
                        : "border-line hover:border-ink/40"
                    }`}
                  >
                    <Icon id={a.icon} size={36} />
                    <span className="flex-1">
                      <span className="block font-bold">{a.name}</span>
                      <span className="block text-[13px] text-ink-soft">{a.blurb}</span>
                    </span>
                    <span className="font-mono text-lg">+${a.price}</span>
                    <span
                      aria-hidden="true"
                      className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${
                        on ? "border-accent bg-accent text-accent-ink" : "border-line"
                      }`}
                    >
                      {on && <span className="text-[11px] leading-none">✓</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-5">
        {!located && (
          <p className="pb-2 text-center text-[13px] text-ink-soft">
            Add your address or tap the map to get started.
          </p>
        )}
        <button
          onClick={onSubmit}
          disabled={!located}
          className={`press-imprint flex min-h-[56px] w-full items-center justify-between rounded-2xl px-6 transition-colors duration-300 ${
            located
              ? "bg-ink text-paper hover:bg-accent"
              : "cursor-not-allowed bg-tint text-ink-soft"
          }`}
        >
          <span className="font-mono text-lg">
            ${price} <span className="text-sm opacity-70">estimate</span>
          </span>
          <span className="text-lg font-bold">
            See my crew <span aria-hidden="true">→</span>
          </span>
        </button>
      </div>
    </div>
  )
}
