import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Icon from "../Icon"
import type { IconId } from "../../lib/data"
import { useSeason } from "../../lib/season"

gsap.registerPlugin(ScrollTrigger)

const STEPS = (season: "winter" | "summer"): { n: string; icon: IconId; title: string; body: string }[] => [
  {
    n: "01",
    icon: "pin",
    title: "Drop your pin",
    body:
      season === "winter"
        ? "Type your address or tap your driveway on the map."
        : "Type your address or tap your yard on the map.",
  },
  {
    n: "02",
    icon: season === "winter" ? "shovel" : "mower",
    title: "A crew comes out",
    body: "Vetted local companies pick up the job nearby.",
  },
  {
    n: "03",
    icon: season === "winter" ? "salt" : "sprinkler",
    title: "Done, and paid fairly",
    body: "You get a flat estimate. The crew keeps 90 percent.",
  },
]

export default function HowItWorks() {
  const { season } = useSeason()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".hiw-rule",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1,
            ease: "power3.inOut",
            stagger: 0.14,
            scrollTrigger: { trigger: root.current, start: "top 72%" },
          },
        )
        gsap.fromTo(
          ".hiw-step",
          { clipPath: "inset(0 0 100% 0)", y: 26 },
          {
            clipPath: "inset(0 0 0% 0)",
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.14,
            clearProps: "clipPath",
            scrollTrigger: { trigger: root.current, start: "top 72%" },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="bg-paper px-6 py-28 sm:px-12 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-2xl text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
          Handled in three steps.
        </h2>
        <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-10">
          {STEPS(season).map((s) => (
            <div key={s.n}>
              <div className="hiw-rule h-px w-full origin-left bg-line" />
              <div className="hiw-step pt-7">
                <div className="flex items-center justify-between">
                  <Icon id={s.icon} size={52} />
                  <span className="font-mono text-[13px] text-ink-soft">{s.n}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight sm:text-2xl">
                  {s.title}
                </h3>
                <p className="mt-2.5 max-w-xs leading-relaxed text-ink-soft">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
