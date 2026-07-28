import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import SiteHeader from "../components/SiteHeader"
import Footer from "../components/Footer"
import {
  PARTNER_EARNINGS,
  PARTNER_INCOMING,
  PARTNER_ROUTE,
  type RouteStop,
} from "../lib/data"
import { useSeason } from "../lib/season"
import PartnerApplyForm from "../components/partners/PartnerApplyForm"

gsap.registerPlugin(ScrollTrigger)

// The public /partners page is the cold-outreach demo: sample data only, so
// anyone can see how dispatch feels without an account. Real partners get the
// live queue at /partners/dashboard after signing in.

interface DemoItem {
  id: string
  address: string
  service: string
  scope: string
  meta: string
  price: number
}

function StatusChip({ status }: { status: RouteStop["status"] }) {
  if (status === "done")
    return (
      <span className="rounded-full bg-tint px-2.5 py-0.5 font-mono text-[11px] text-ink-soft">
        done
      </span>
    )
  if (status === "in progress")
    return (
      <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[11px] text-accent-ink">
        in progress
      </span>
    )
  return (
    <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-ink-soft">
      scheduled
    </span>
  )
}

export default function Partners() {
  const { season } = useSeason()
  const earnings = PARTNER_EARNINGS[season]
  const root = useRef<HTMLElement>(null)
  const weekEl = useRef<HTMLSpanElement>(null)

  const [gone, setGone] = useState<string[]>([])
  const [routeExtras, setRouteExtras] = useState<RouteStop[]>([])
  const [leaving, setLeaving] = useState<string | null>(null)

  const incoming: DemoItem[] = PARTNER_INCOMING[season]
    .filter((r) => !gone.includes(r.id))
    .map((r) => ({
      id: r.id,
      address: r.address,
      service: r.service,
      scope: r.scope,
      meta: `${r.distanceMi} mi`,
      price: r.price,
    }))
  const route: RouteStop[] = [...PARTNER_ROUTE[season], ...routeExtras]

  useEffect(() => {
    document.title = "CapitalClear for partners"
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { v: 0 }
        const tweens = [
          gsap.to(counter, {
            v: earnings.weekTotal,
            duration: 1.5,
            ease: "power3.out",
            delay: 0.35,
            onUpdate: () => {
              if (weekEl.current)
                weekEl.current.textContent = `$${Math.round(counter.v).toLocaleString()}`
            },
          }),
          gsap.fromTo(
            ".pt-split",
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: "power3.inOut", delay: 0.5 },
          ),
          gsap.fromTo(
            ".pt-bar",
            { scaleY: 0 },
            { scaleY: 1, duration: 0.7, ease: "power3.out", stagger: 0.07, delay: 0.7 },
          ),
        ]
        const settle = window.setTimeout(() => {
          tweens.forEach((t) => t.progress(1))
        }, 2600)
        return () => window.clearTimeout(settle)
      })
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The intro tween writes the week total imperatively, detaching React's text
  // node. Re-assert the seasonal total on every flip.
  useEffect(() => {
    if (weekEl.current)
      weekEl.current.textContent = `$${earnings.weekTotal.toLocaleString()}`
  }, [earnings.weekTotal])

  const finish = (item: DemoItem, accepted: boolean) => {
    setGone((g) => [...g, item.id])
    if (accepted) {
      setRouteExtras((list) => [
        ...list,
        {
          id: `route-${item.id}`,
          time: "next up",
          address: item.address,
          service: item.service,
          price: item.price,
          status: "scheduled",
        },
      ])
    }
    setLeaving(null)
  }

  const accept = (item: DemoItem) => {
    setLeaving(item.id)
    window.setTimeout(() => finish(item, true), 260)
  }
  const decline = (item: DemoItem) => {
    setLeaving(item.id)
    window.setTimeout(() => finish(item, false), 260)
  }

  const maxDay = Math.max(...earnings.days.map(([, v]) => v))

  return (
    <>
      <SiteHeader current="partners" />
      <main ref={root} className="mx-auto max-w-5xl px-6 pt-28 pb-20 sm:pt-32">
        <header className="cc-fade-up max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
              partner dashboard
            </p>
            <span className="rounded-full bg-tint px-2.5 py-0.5 font-mono text-[11px] text-ink-soft">
              demo
            </span>
          </div>
          <h1 className="mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            {season === "winter" ? "Your plow route, dispatched." : "Your crew routes, dispatched."}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            {season === "winter"
              ? "This is the partner side of the demo: when the snow falls, nearby requests come to you, your route fills itself, and you keep 85 percent of every dollar."
              : "This is the partner side of the demo: all season long, nearby requests come to you, your route fills itself, and you keep 85 percent of every dollar."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              to="/partners/login"
              className="press-imprint rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
            >
              Partner sign in
            </Link>
            <a href="#apply" className="font-mono text-[13px] text-accent hover:underline">
              Apply to join
            </a>
          </div>
        </header>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {/* Incoming requests */}
            <section className="cc-fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-baseline justify-between border-b border-line pb-3">
                <h2 className="text-xl font-bold tracking-tight">Incoming requests</h2>
                <span className="rounded-full bg-tint px-3 py-1 font-mono text-[12px] text-ink-soft">
                  {incoming.length} nearby
                </span>
              </div>
              {incoming.length === 0 ? (
                <p className="cc-fade-up py-8 text-ink-soft">
                  Queue is clear. New requests appear here as neighbors book.
                </p>
              ) : (
                <ul>
                  {incoming.map((req) => (
                    <li
                      key={req.id}
                      className={`cc-fade-up flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4 transition-all duration-300 ${
                        leaving === req.id
                          ? "-translate-x-4 scale-[0.99] opacity-0"
                          : "opacity-100"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{req.address}</p>
                        <p className="mt-0.5 font-mono text-[12px] text-ink-soft">
                          {req.service} · {req.scope} · {req.meta}
                        </p>
                      </div>
                      <span className="font-mono text-lg">${req.price}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => accept(req)}
                          className="press-imprint rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => decline(req)}
                          className="text-sm text-ink-soft transition-colors hover:text-ink"
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Today's route */}
            <section className="cc-fade-up" style={{ animationDelay: "0.18s" }}>
              <div className="border-b border-line pb-3">
                <h2 className="text-xl font-bold tracking-tight">Today's route</h2>
              </div>
              <ul>
                {route.map((stop) => (
                  <li
                    key={stop.id}
                    className="cc-fade-up flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line py-4"
                  >
                    <span className="w-20 font-mono text-[13px] text-ink-soft">
                      {stop.time}
                    </span>
                    <span
                      className={`min-w-0 flex-1 font-semibold ${
                        stop.status === "done" ? "text-ink-soft line-through" : ""
                      }`}
                    >
                      {stop.address}
                    </span>
                    <span className="hidden font-mono text-[12px] text-ink-soft sm:block">
                      {stop.service}
                    </span>
                    <span className="font-mono">${stop.price}</span>
                    <StatusChip status={stop.status} />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Earnings aside */}
          <aside className="cc-fade-up h-fit rounded-3xl bg-tint p-7" style={{ animationDelay: "0.26s" }}>
            <p className="font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
              This week
            </p>
            <p className="mt-2 font-mono text-5xl font-semibold tracking-tight">
              <span ref={weekEl}>${earnings.weekTotal.toLocaleString()}</span>
            </p>
            <div className="mt-5 flex h-2 w-full overflow-hidden rounded-full bg-ink/10">
              <div className="pt-split h-full w-[85%] origin-left bg-accent" />
              <div className="h-full w-[15%] bg-ink/25" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              You keep 85 percent:{" "}
              <span className="font-mono font-semibold text-ink">
                ${earnings.afterFee.toLocaleString()}
              </span>{" "}
              paid out Friday.
            </p>
            <div className="mt-7 flex items-end gap-2.5">
              {earnings.days.map(([day, v]) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="pt-bar w-full origin-bottom rounded-t-sm bg-accent/35"
                    style={{ height: Math.round((v / maxDay) * 64) + 8 }}
                  />
                  <span className="font-mono text-[10px] text-ink-soft">{day}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-line pt-4 text-[13px] leading-relaxed text-ink-soft">
              No lead fees, no subscriptions. CapitalClear takes 15 percent of
              completed jobs, nothing else.
            </p>
          </aside>
        </div>

        <p className="mt-14 font-mono text-[12px] text-ink-soft">
          Demo with sample jobs and earnings.{" "}
          <Link to="/request" className="text-accent hover:underline">
            See the customer side
          </Link>
        </p>

        <PartnerApplyForm />
      </main>
      <Footer />
    </>
  )
}
