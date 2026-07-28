import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSeason } from "../../lib/season"

gsap.registerPlugin(ScrollTrigger)

/** Oversized mono strapline that drifts horizontally with scroll. */
export default function Marquee() {
  const { season } = useSeason()
  const root = useRef<HTMLElement>(null)
  const line =
    season === "winter"
      ? "Plowed. Cleared. Handled. Plowed. Cleared. Handled."
      : "Mowed. Trimmed. Handled. Mowed. Trimmed. Handled."

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".marquee-track",
          { xPercent: 4 },
          {
            xPercent: -22,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      aria-hidden="true"
      className="overflow-hidden border-y border-line bg-paper py-8 sm:py-10"
    >
      <div className="marquee-track font-mono text-[11vw] leading-none font-semibold tracking-[0.06em] whitespace-nowrap text-ink/[0.07] uppercase select-none sm:text-[8vw]">
        {line}
      </div>
    </section>
  )
}
