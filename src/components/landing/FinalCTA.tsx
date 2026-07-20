import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Snowfall from "../Snowfall"
import { useSeason } from "../../lib/season"
import { SERVICES } from "../../lib/data"

gsap.registerPlugin(ScrollTrigger)

export default function FinalCTA() {
  const { season } = useSeason()
  const root = useRef<HTMLElement>(null)
  const fromPrice = Math.min(...SERVICES[season].map((s) => s.base))

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".fc-item",
          { opacity: 0, scale: 0.96, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: root.current, start: "top 68%" },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-tint/70 px-6 py-32 text-center sm:py-44"
    >
      {season === "winter" && <Snowfall density={40} className="opacity-70" />}
      <div className="relative mx-auto max-w-3xl">
        <h2 className="fc-item text-5xl leading-[0.98] font-extrabold tracking-tight sm:text-7xl">
          {season === "winter" ? "Snowed in again?" : "Yard overgrown?"}
          <span className="block text-accent">It takes one tap.</span>
        </h2>
        <div className="fc-item mt-12 flex flex-col items-center gap-6">
          <Link
            to="/request"
            className="press-imprint flex w-full max-w-md items-center justify-between rounded-2xl bg-ink px-7 py-5 text-paper transition-colors duration-300 hover:bg-accent"
          >
            <span className="font-mono">from ${fromPrice}</span>
            <span className="text-lg font-bold">Request service →</span>
          </Link>
          <Link to="/partners" className="cta-brackets text-ink">
            Become a partner
          </Link>
        </div>
      </div>
    </section>
  )
}
