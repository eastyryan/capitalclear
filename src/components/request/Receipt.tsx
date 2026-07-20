import { useEffect } from "react"
import { SEASON_COPY, type Provider, type Service } from "../../lib/data"
import { useSeason } from "../../lib/season"
import { trackEvent } from "../../lib/analytics"
import Odometer from "../Odometer"

export default function Receipt({
  provider,
  service,
  price,
  completedAt,
  paid = false,
  onReset,
}: {
  provider: Provider
  service: Service
  price: number
  completedAt: string
  paid?: boolean
  onReset: () => void
}) {
  const { season } = useSeason()
  const copy = SEASON_COPY[season]

  useEffect(() => {
    trackEvent("request_flow_complete", { service: service.id, price })
  }, [service.id, price])

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-paper/95 p-5 backdrop-blur-sm">
      <div className="cc-sheet-in w-full max-w-md rounded-3xl border border-ink bg-paper p-8 text-center sm:p-10">
        <img
          src="/assets/vignette-done.webp"
          alt=""
          className="cc-vignette mx-auto -mt-2 w-44"
        />
        <p className="mt-2 font-mono text-[13px] text-ink-soft">
          {service.name}, completed {completedAt}
        </p>
        <p className="mt-1 text-lg font-semibold">{copy.doneLine}</p>

        <div className="mt-6 text-[5.5rem] leading-none font-semibold tracking-tight sm:text-8xl">
          <Odometer value={price} />
        </div>

        {paid && (
          <p className="mt-3 inline-block rounded-full bg-accent/10 px-3 py-1 font-mono text-[12px] font-semibold text-accent">
            Paid ${price}
          </p>
        )}

        <div className="mt-6 space-y-0.5 border-t border-line pt-5 text-sm text-ink-soft">
          <p>
            <span className="font-semibold text-ink">{provider.name}</span> keeps 90
            percent.
          </p>
          <p>CapitalClear runs on 10 percent.</p>
        </div>

        <button
          onClick={onReset}
          className="press-imprint mt-7 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink text-lg font-bold text-paper transition-colors duration-300 hover:bg-accent"
        >
          {copy.receiptCta}
        </button>
        <p className="mt-3 text-sm text-ink-soft">{copy.receiptMicroline}</p>
        <p className="mt-5 font-mono text-[11px] text-ink-soft">
          {paid
            ? "Sample providers. Payment processed securely by Stripe."
            : "Demo with sample providers. No payment was made."}
        </p>
      </div>
    </div>
  )
}
