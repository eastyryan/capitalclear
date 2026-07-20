import { useState } from "react"
import { PROVIDERS, providerPrice, type Provider } from "../../lib/data"
import { useSeason } from "../../lib/season"

export default function CrewConfirm({
  searching,
  basePrice,
  onConfirm,
  onBack,
}: {
  searching: boolean
  basePrice: number
  onConfirm: (p: Provider) => void
  onBack: () => void
}) {
  const { season } = useSeason()
  const providers = PROVIDERS[season]
  const [picked, setPicked] = useState<Provider>(providers[0])
  const [expanded, setExpanded] = useState(false)
  const alternates = providers.filter((p) => p.id !== picked.id)

  if (searching) {
    return (
      <div
        className="cc-sheet-in absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md rounded-t-3xl bg-paper/95 p-8 text-center ring-1 ring-line backdrop-blur-md sm:bottom-8 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mx-auto h-16 w-16">
          <span className="cc-radar absolute inset-0 rounded-full border-2 border-accent/70" />
          <span className="cc-radar cc-radar-late absolute inset-0 rounded-full border-2 border-accent/40" />
          <span className="absolute inset-[26px] rounded-full bg-accent" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight">Finding your crew</h2>
        <p className="mt-1.5 font-mono text-[13px] text-ink-soft">
          checking {providers.length} crews nearby
        </p>
      </div>
    )
  }

  return (
    <div
      className="cc-sheet-in absolute inset-x-0 bottom-0 z-20 mx-auto flex max-h-[80dvh] w-full max-w-md flex-col rounded-t-3xl bg-paper/95 ring-1 ring-line backdrop-blur-md sm:bottom-8 sm:rounded-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="overflow-y-auto px-6 pt-6 sm:px-7">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
            Your crew
          </p>
          <button
            onClick={onBack}
            className="font-mono text-[13px] text-ink-soft transition-colors hover:text-accent"
          >
            Back
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-deep font-mono font-semibold text-white">
            {picked.monogram}
          </span>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">{picked.name}</h2>
            <p className="font-mono text-[13px] text-ink-soft">
              ★ {picked.rating} · {picked.jobs} jobs
            </p>
          </div>
        </div>

        <img
          src={picked.photo}
          alt={`${picked.name} crew at work`}
          className="mt-4 aspect-[3/2] w-full rounded-2xl object-cover ring-1 ring-line"
        />

        <p className="mt-4 flex items-baseline justify-between font-mono">
          <span className="text-ink-soft">Arrives in {picked.etaMin} min</span>
          <span className="text-xl font-semibold">
            ${providerPrice(basePrice, picked)}
          </span>
        </p>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full border-t border-line pt-3.5 pb-1 text-center text-sm font-semibold text-accent"
        >
          {expanded ? "Keep this crew" : "Choose a different crew"}
        </button>

        {expanded && (
          <div className="cc-fade-up space-y-2 pt-2 pb-1">
            {alternates.map((p) => (
              <div
                key={p.id}
                className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tint font-mono text-[13px] font-semibold text-ink">
                  {p.monogram}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">{p.name}</span>
                  <span className="block font-mono text-[12px] text-ink-soft">
                    {p.rating} · {p.etaMin} min · ${providerPrice(basePrice, p)}
                  </span>
                </span>
                <button
                  onClick={() => {
                    setPicked(p)
                    setExpanded(false)
                  }}
                  className="press-imprint rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-ink"
                >
                  Pick
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-5">
        <button
          onClick={() => onConfirm(picked)}
          className="press-imprint flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink text-lg font-bold text-paper transition-colors duration-300 hover:bg-accent"
        >
          Confirm crew
        </button>
      </div>
    </div>
  )
}
