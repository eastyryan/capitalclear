import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TRACK_STAGES } from "../../lib/data"
import { DRIVEWAY_END, coverMap, roadPolyline, sampleRoad } from "../../lib/roadPath"
import MapPin from "../MapPin"

gsap.registerPlugin(ScrollTrigger)

const ETA_FOR = (p: number) => (p < 0.25 ? 12 : p < 0.5 ? 6 : p < 0.68 ? 2 : 0)

// Dev-only: /?pose=0.45 renders the scene statically at that progress so the
// choreography can be inspected without scrolling.
export function devPose(): number | null {
  if (!import.meta.env.DEV) return null
  const raw = new URLSearchParams(window.location.search).get("pose")
  if (raw === null) return null
  const v = Number(raw)
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : null
}

export default function ClearingScene() {
  const root = useRef<HTMLElement>(null)
  const truck = useRef<HTMLImageElement>(null)
  const zoom = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const route = useRef<SVGPathElement>(null)
  const snow = useRef<SVGPathElement>(null)
  const swath = useRef<SVGPathElement>(null)
  const patch = useRef<HTMLDivElement>(null)
  const pinEl = useRef<HTMLDivElement>(null)
  const etaEl = useRef<HTMLSpanElement>(null)
  const cue = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [stageIdx, setStageIdx] = useState(0)
  const stageRef = useRef(0)

  useEffect(() => {
    // object-cover mapping from image space to container pixels, kept fresh
    // by the ResizeObserver below.
    let map = coverMap(1, 1)
    const lastP = { v: 0 }

    const apply = (p: number) => {
      lastP.v = p
      // Truck drives the route for the first 70% of the scene.
      const t = Math.min(1, p / 0.7)
      const s = sampleRoad(t)
      const pos = map(s)
      if (truck.current) {
        truck.current.style.left = `${pos.x.toFixed(1)}px`
        truck.current.style.top = `${pos.y.toFixed(1)}px`
        truck.current.style.transform = `translate(-50%, -50%) rotate(${(s.angle + 90).toFixed(1)}deg)`
        truck.current.style.opacity = "1"
      }
      // Pulsing beacon rides with the truck so the eye finds it instantly;
      // it retires once the job is done.
      if (glow.current) {
        glow.current.style.left = `${pos.x.toFixed(1)}px`
        glow.current.style.top = `${pos.y.toFixed(1)}px`
        glow.current.style.opacity = p < 0.7 ? "1" : "0"
      }
      // Big centered cue until the user actually starts scrolling the scene.
      if (cue.current) {
        const show = p < 0.06
        cue.current.style.opacity = show ? "1" : "0"
        cue.current.style.pointerEvents = "none"
        cue.current.style.transform = `translate(-50%, ${show ? "0" : "14px"})`
      }
      if (bar.current) {
        bar.current.style.transform = `scaleX(${p.toFixed(4)})`
      }
      // Behind the truck: dark plowed asphalt. Ahead of it: the road still
      // buried in white snow. The truck visibly converts one into the other.
      if (swath.current) {
        swath.current.style.strokeDashoffset = String(1 - t)
      }
      if (snow.current) {
        snow.current.style.strokeDashoffset = String(-t)
      }
      // Slow camera push-in as the job progresses. The whole layer stack
      // scales together so the overlays stay glued to the road.
      if (zoom.current) {
        zoom.current.style.transform = `scale(${(1 + p * 0.07).toFixed(4)})`
      }
      // Driveway patch clears between 70% and 92%.
      const w = Math.max(0, Math.min(1, (p - 0.7) / 0.22))
      if (patch.current) {
        patch.current.style.transform = `translate(-50%, -50%) scale(${w})`
        patch.current.style.opacity = String(0.55 * w)
      }
      if (pinEl.current) {
        pinEl.current.style.opacity = p > 0.92 ? "1" : "0"
      }
      if (etaEl.current) {
        const eta = ETA_FOR(p)
        etaEl.current.textContent = eta > 0 ? `${eta} min` : "on site"
      }
      const idx = p < 0.68 ? 0 : p < 0.72 ? 1 : p < 0.92 ? 2 : 3
      if (idx !== stageRef.current) {
        stageRef.current = idx
        setStageIdx(idx)
      }
    }

    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__scene = apply
    }

    // Rebuild the mapping, the swath geometry, and the fixed markers whenever
    // the stage resizes. Everything lives in pixel space.
    const sync = () => {
      const host = svg.current?.parentElement
      if (!host || !svg.current || !swath.current) return
      const { clientWidth: w, clientHeight: h } = host
      if (w === 0 || h === 0) return
      map = coverMap(w, h)
      svg.current.setAttribute("viewBox", `0 0 ${w} ${h}`)
      const pts = roadPolyline().map(map)
      const d =
        `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} ` +
        pts
          .slice(1)
          .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ")
      swath.current.setAttribute("d", d)
      snow.current?.setAttribute("d", d)
      route.current?.setAttribute("d", d)
      const dest = map(DRIVEWAY_END)
      if (patch.current) {
        patch.current.style.left = `${dest.x.toFixed(1)}px`
        patch.current.style.top = `${dest.y.toFixed(1)}px`
      }
      if (pinEl.current) {
        pinEl.current.style.left = `${dest.x.toFixed(1)}px`
        pinEl.current.style.top = `${dest.y.toFixed(1)}px`
      }
      apply(lastP.v)
    }
    sync()
    const ro = new ResizeObserver(sync)
    if (svg.current?.parentElement) ro.observe(svg.current.parentElement)

    const pose = devPose()

    const ctx = gsap.context(() => {
      if (pose !== null) {
        apply(pose)
        return
      }
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=240%",
          pin: ".clearing-stage",
          scrub: 0.5,
          onUpdate: (self) => apply(self.progress),
        })
        gsap.fromTo(
          ".clearing-head",
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top 65%" },
          },
        )
      })
      mm.add("(prefers-reduced-motion: reduce)", () => {
        apply(1)
      })
    }, root)

    return () => {
      ro.disconnect()
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={root}
      aria-label="How a clearing runs, animated"
      data-season="winter"
    >
      <div className="clearing-stage relative h-[100svh] overflow-hidden">
        <div ref={zoom} className="absolute inset-0 will-change-transform">
          <img
            src="/assets/plate-winter.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

        {/* Route ahead + plowed swath behind the truck, tracing the road */}
        <svg
          ref={svg}
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Unplowed snow sitting on the road ahead of the truck */}
          <path
            ref={snow}
            d=""
            fill="none"
            stroke="rgb(255 255 255 / 0.85)"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={0}
          />
          {/* Plowed asphalt behind the truck */}
          <path
            ref={swath}
            d=""
            fill="none"
            stroke="rgb(84 106 130 / 0.65)"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
            style={{ mixBlendMode: "multiply" }}
          />
          {/* Dotted route preview so the whole journey reads at a glance */}
          <path
            ref={route}
            d=""
            fill="none"
            stroke="#2b5fb8"
            strokeWidth="4"
            strokeDasharray="0.1 16"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>

        {/* Cleared driveway patch at the destination */}
        <div
          ref={patch}
          aria-hidden="true"
          className="absolute h-[64px] w-[104px] rounded-full bg-[#5a7186] opacity-0 mix-blend-multiply blur-[2px]"
          style={{ transform: "translate(-50%,-50%) scale(0)" }}
        />

        {/* Destination pin pops when done */}
        <div
          ref={pinEl}
          aria-hidden="true"
          className="absolute opacity-0 transition-opacity duration-300"
        >
          <div style={{ transform: "translate(-50%,-100%)" }}>
            <MapPin size={40} />
          </div>
        </div>

        {/* Beacon rings that travel with the truck */}
        <div ref={glow} aria-hidden="true" className="absolute transition-opacity duration-500">
          <span className="cc-radar absolute -top-12 -left-12 block h-24 w-24 rounded-full border-[3px] border-accent/80" />
          <span className="cc-radar cc-radar-late absolute -top-12 -left-12 block h-24 w-24 rounded-full border-[3px] border-accent/50" />
        </div>

          <img
            ref={truck}
            src="/assets/truck.png"
            alt=""
            className="absolute w-16 opacity-0 drop-shadow-[0_10px_18px_rgb(24_32_42/0.5)] sm:w-20"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/70 via-transparent to-transparent" />

        {/* Scroll cue: front and center until the scene starts moving */}
        <div
          ref={cue}
          className="absolute top-[44%] left-1/2 z-10 w-[calc(100%-2.5rem)] max-w-xs transition-all duration-500 sm:top-[54%] sm:w-auto sm:max-w-none"
          style={{ transform: "translate(-50%, 0)" }}
        >
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-paper/95 px-6 py-5 text-center shadow-[0_24px_70px_-24px_rgb(24_32_42/0.55)] ring-1 ring-line backdrop-blur-md sm:gap-2.5 sm:px-10 sm:py-7">
            <img src="/assets/truck.png" alt="" className="w-10 rotate-90 sm:w-12" />
            <p className="text-xl font-extrabold tracking-tight sm:text-3xl">
              Scroll to run the plow.
            </p>
            <p className="font-mono text-[11px] text-ink-soft sm:text-[12px]">
              the truck follows your scroll, start to driveway
            </p>
            <span
              aria-hidden="true"
              className="animate-bounce text-2xl font-bold text-accent sm:mt-1"
            >
              ↓
            </span>
          </div>
        </div>

        {/* Scene progress bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-ink/10">
          <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
        </div>

        {/* Headline */}
        <div className="clearing-head absolute top-20 left-6 max-w-sm sm:top-24 sm:left-12">
          <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
            the ride view
          </p>
          <h2 className="mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            Watch it get handled.
          </h2>
          <p className="mt-4 text-base text-ink-soft sm:text-lg">
            Scroll to run a clearing the way you would track it live.
          </p>
        </div>

        {/* Status rail */}
        <div className="absolute right-6 bottom-8 w-56 rounded-2xl bg-paper/90 p-5 ring-1 ring-line backdrop-blur-md sm:right-12 sm:bottom-12">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase">
              eta
            </span>
            <span ref={etaEl} className="font-mono text-lg font-semibold text-accent">
              12 min
            </span>
          </div>
          <ol className="mt-4 space-y-2.5">
            {TRACK_STAGES.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2.5 font-mono text-[13px]">
                <span
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    i <= stageIdx ? "bg-accent" : "bg-line"
                  }`}
                />
                <span
                  className={`transition-colors duration-300 ${
                    i === stageIdx ? "text-ink" : i < stageIdx ? "text-ink-soft line-through" : "text-ink-soft"
                  }`}
                >
                  {s.label.winter}
                </span>
              </li>
            ))}
          </ol>
          {stageIdx === 3 && (
            <p className="cc-fade-up mt-3 border-t border-line pt-3 text-[13px] text-ink-soft">
              Cleared to the pavement.
            </p>
          )}
        </div>

        <p className="absolute bottom-4 left-6 font-mono text-[11px] text-ink-soft sm:left-12">
          Demo with sample providers
        </p>
      </div>
    </section>
  )
}
