import { useEffect } from "react"
import {
  PARTNER_SHARE_PCT,
  PLATFORM_FEE_PCT,
  SEASON_COPY,
  addonsFor,
  hstOn,
  type AddonId,
  type Provider,
  type Service,
} from "../../lib/data"
import { useSeason } from "../../lib/season"
import { trackEvent } from "../../lib/analytics"
import Odometer from "../Odometer"

export default function Receipt({
  provider,
  service,
  price,
  addons = [],
  completedAt,
  paid = false,
  onReset,
}: {
  provider: Provider
  service: Service
  price: number
  addons?: AddonId[]
  completedAt: string
  paid?: boolean
  onReset: () => void
}) {
  const { season } = useSeason()
  const copy = SEASON_COPY[season]
  const extras = addonsFor(season, addons)
  // `price` is the pre-tax subtotal; Ontario HST is added at checkout. The
  // odometer keeps the whole-dollar subtotal (it only rolls digits), so the
  // tax and the amount actually charged sit on the line beneath it.
  const hst = hstOn(price)
  const total = price + hst

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
        {extras.length > 0 && (
          <p className="mt-2 font-mono text-[12px] text-ink-soft">
            {service.name}
            {extras.map((a) => (
              <span key={a.id}>
                <span aria-hidden="true" className="px-1.5">
                  +
                </span>
                {a.name} ${a.price}
              </span>
            ))}
          </p>
        )}
        <p className="mt-2 font-mono text-[12px] text-ink-soft">
          Subtotal ${price}
          <span aria-hidden="true" className="px-1.5">
            ·
          </span>
          HST 13% ${hst.toFixed(2)}
          <span aria-hidden="true" className="px-1.5">
            ·
          </span>
          <span className="font-semibold text-ink">Total ${total.toFixed(2)}</span>
        </p>

        {paid && (
          <p className="mt-3 inline-block rounded-full bg-accent/10 px-3 py-1 font-mono text-[12px] font-semibold text-accent">
            Paid ${total.toFixed(2)}
          </p>
        )}

        <div className="mt-6 space-y-0.5 border-t border-line pt-5 text-sm text-ink-soft">
          <p>
            <span className="font-semibold text-ink">{provider.name}</span> keeps{" "}
            {PARTNER_SHARE_PCT} percent.
          </p>
          <p>CapitalClear runs on {PLATFORM_FEE_PCT} percent.</p>
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
