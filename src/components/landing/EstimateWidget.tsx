import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SCOPES, SEASON_COPY, SERVICES, priceFor, type ScopeId } from "../../lib/data"
import { trackEvent } from "../../lib/analytics"
import { useSeason } from "../../lib/season"
import Icon from "../Icon"
import Odometer from "../Odometer"

gsap.registerPlugin(ScrollTrigger)

export default function EstimateWidget() {
  const { season } = useSeason()
  const services = SERVICES[season]
  const root = useRef<HTMLElement>(null)
  const [serviceId, setServiceId] = useState<string>(services[0].id)
  const [scope, setScope] = useState<ScopeId>("medium")

  useEffect(() => {
    setServiceId(SERVICES[season][0].id)
  }, [season])

  const service = services.find((s) => s.id === serviceId) ?? services[0]
  const price = priceFor(service, scope)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".est-left",
          { opacity: 0, x: -36 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top 70%" },
          },
        )
        gsap.fromTo(
          ".est-right",
          { opacity: 0, x: 36 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: 0.12,
            scrollTrigger: { trigger: root.current, start: "top 70%" },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="bg-tint/60 px-6 py-28 sm:px-12 sm:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="est-left">
          <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
            live estimate
          </p>
          <h2 className="mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            Know the price before you tap.
          </h2>
          <div className="mt-10 space-y-3" role="radiogroup" aria-label="Service">
            {services.map((s) => (
              <button
                key={s.id}
                role="radio"
                aria-checked={s.id === serviceId}
                onClick={() => {
                  setServiceId(s.id)
                  trackEvent("estimate_interact", { service: s.id })
                }}
                className={`flex w-full items-center gap-4 rounded-2xl border bg-paper px-5 py-4 text-left transition-all duration-200 ${
                  s.id === serviceId
                    ? "border-accent shadow-[0_14px_40px_-22px_rgb(43_95_184/0.55)]"
                    : "border-line hover:border-ink/40"
                }`}
              >
                <Icon id={s.icon} size={40} />
                <span className="flex-1">
                  <span className="block font-bold">{s.name}</span>
                  <span className="block text-sm text-ink-soft">{s.blurb}</span>
                </span>
                <span className="font-mono text-lg">${priceFor(s, scope)}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="font-mono text-[12px] tracking-[0.14em] text-ink-soft uppercase">
              {SEASON_COPY[season].sizeLabel}
            </span>
            <div className="flex gap-2" role="radiogroup" aria-label="Driveway size">
              {SCOPES.map((sc) => (
                <button
                  key={sc.id}
                  role="radio"
                  aria-checked={sc.id === scope}
                  onClick={() => {
                    setScope(sc.id)
                    trackEvent("estimate_interact", { scope: sc.id })
                  }}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                    sc.id === scope
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-line bg-paper text-ink-soft hover:border-ink/40"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="est-right">
          <div className="rounded-3xl bg-paper p-8 ring-1 ring-line sm:p-10">
            <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
              {service.name}
            </p>
            <div className="mt-4 text-[clamp(4.5rem,10vw,7.5rem)] leading-none font-semibold tracking-tight">
              <Odometer value={price} />
            </div>
            <p className="mt-3 font-mono text-sm text-ink-soft">
              estimate · flat, no surge
            </p>
            <Link
              to="/request"
              className="press-imprint mt-8 flex items-center justify-between rounded-2xl bg-ink px-6 py-5 text-paper transition-colors duration-300 hover:bg-accent"
            >
              <span className="font-mono text-lg">${price} estimate</span>
              <span className="text-lg font-bold">
                See my crew{" "}
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
            <p className="mt-4 text-center font-mono text-[11px] text-ink-soft">
              Real pricing math from the live demo
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
