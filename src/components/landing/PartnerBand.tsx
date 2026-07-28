import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { PARTNER_EARNINGS } from "../../lib/data"
import { useSeason } from "../../lib/season"

gsap.registerPlugin(ScrollTrigger)

export default function PartnerBand() {
  const { season } = useSeason()
  const earnings = PARTNER_EARNINGS[season]
  const root = useRef<HTMLElement>(null)
  const ninety = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { v: 0 }
        gsap.to(counter, {
          v: 85,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 62%", once: true },
          onUpdate: () => {
            if (ninety.current) ninety.current.textContent = String(Math.round(counter.v))
          },
        })
        gsap.fromTo(
          ".pb-split",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.3,
            ease: "power3.inOut",
            scrollTrigger: { trigger: root.current, start: "top 62%", once: true },
          },
        )
        gsap.fromTo(
          ".pb-bar",
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: "top 55%", once: true },
          },
        )
        gsap.fromTo(
          ".pb-copy",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: "top 68%" },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const maxDay = Math.max(...earnings.days.map(([, v]) => v))

  return (
    <section ref={root} className="bg-deep px-6 py-28 text-white sm:px-12 sm:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="pb-copy font-mono text-[12px] tracking-[0.18em] text-white/60 uppercase">
            {season === "winter" ? "for plow companies" : "for lawn crews"}
          </p>
          <h2 className="pb-copy mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            Partners keep 85 percent.
          </h2>
          <p className="pb-copy mt-6 max-w-md text-lg leading-relaxed text-white/75">
            {season === "winter"
              ? "Every storm, CapitalClear fills your plow route with nearby jobs and takes 15 percent only when a job completes. No lead fees, no subscriptions."
              : "All season, CapitalClear fills your crew routes with nearby jobs and takes 15 percent only when a job completes. No lead fees, no subscriptions."}
          </p>
          <div className="pb-copy mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              to="/partners#apply"
              className="cta-brackets text-lg text-white"
              style={{ color: "white" }}
            >
              Become a partner <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/partners"
              className="font-mono text-[13px] text-white/70 transition-colors hover:text-white"
            >
              See the partner dashboard
            </Link>
          </div>
        </div>

        <div>
          <div className="font-mono text-[clamp(6rem,14vw,10rem)] leading-none font-semibold tracking-tight">
            <span ref={ninety}>85</span>
            <span className="text-white/40">/15</span>
          </div>
          <div className="mt-8 flex h-2.5 w-full overflow-hidden rounded-full">
            <div className="pb-split h-full w-[85%] origin-left bg-white" />
            <div className="h-full w-[15%] bg-white/25" />
          </div>
          <p className="mt-3 font-mono text-[13px] text-white/60">
            you keep $
            {earnings.afterFee.toLocaleString()} of a $
            {earnings.weekTotal.toLocaleString()} week
          </p>
          <div className="mt-10 flex items-end gap-3">
            {earnings.days.map(([day, v]) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="pb-bar w-full origin-bottom rounded-t-sm bg-white/30"
                  style={{ height: Math.round((v / maxDay) * 64) + 8 }}
                />
                <span className="font-mono text-[11px] text-white/50">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
