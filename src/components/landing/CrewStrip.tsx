import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { PROVIDERS } from "../../lib/data"
import { useSeason } from "../../lib/season"

gsap.registerPlugin(ScrollTrigger)

export default function CrewStrip() {
  const { season } = useSeason()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".crew-card",
          { clipPath: "inset(100% 0 0 0)", y: 40 },
          {
            clipPath: "inset(0% 0 0 0)",
            y: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.14,
            scrollTrigger: { trigger: root.current, start: "top 70%" },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="bg-paper px-6 py-28 sm:px-12 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            The crews next door.
          </h2>
          <p className="max-w-xs pb-2 text-ink-soft">
            Local companies you already trust, dispatched like a ride.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PROVIDERS[season].map((p, i) => (
            <article
              key={p.id}
              className={`crew-card group overflow-hidden rounded-3xl bg-tint ring-1 ring-line ${
                i === 1 ? "sm:translate-y-8" : ""
              }`}
            >
              <div className="overflow-hidden">
                <img
                  src={p.photo}
                  alt={`${p.name} crew at work`}
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-deep font-mono text-sm font-semibold text-white">
                    {p.monogram}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
                </div>
                <p className="mt-3 font-mono text-[13px] text-ink-soft">
                  ★ {p.rating} · {p.jobs} jobs · {p.etaMin} min away
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
