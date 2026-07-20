import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Snowfall from "../Snowfall"
import { useSeason } from "../../lib/season"
import type { Season } from "../../lib/data"

gsap.registerPlugin(ScrollTrigger)

const CONTENT: Record<
  Season,
  { img: string; alt: string; aria: string; lines: string[][]; sub: string }
> = {
  winter: {
    img: "/assets/hero-winter.webp",
    alt: "A plow truck clearing a suburban driveway the morning after heavy snowfall",
    aria: "Snowed in? Handled.",
    lines: [["Snowed", "in?"], ["Handled."]],
    sub: "Drop a pin and a local crew clears your driveway, walkway, and steps. Flat estimate up front, tracked live like a ride.",
  },
  summer: {
    img: "/assets/hero-split.webp",
    alt: "The same house in summer and winter, lawn cut and driveway cleared",
    aria: "Your yard, handled. All year.",
    lines: [["Your", "yard,", "handled."], ["All", "year."]],
    sub: "Drop a pin and a local crew mows, trims, and edges. Flat estimate up front, tracked live like a ride.",
  },
}

export default function Hero() {
  const { season } = useSeason()
  const c = CONTENT[season]
  const root = useRef<HTMLElement>(null)
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Ken Burns settle on load.
        gsap.fromTo(
          img.current,
          { scale: 1.1 },
          { scale: 1, duration: 2.4, ease: "power2.out" },
        )
        // Headline words rise out of their clip wrappers.
        gsap.fromTo(
          ".hero-word",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.05,
            ease: "power4.out",
            stagger: 0.09,
            delay: 0.25,
          },
        )
        gsap.fromTo(
          ".hero-sub",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.85 },
        )
        // Parallax out.
        gsap.to(img.current, {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        gsap.to(".hero-copy", {
          yPercent: -18,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [season])

  return (
    <section key={season} ref={root} className="relative h-[100svh] overflow-hidden">
      <img
        ref={img}
        src={c.img}
        alt={c.alt}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-ink/20" />
      {season === "winter" && <Snowfall density={80} />}

      <div className="hero-copy absolute inset-x-0 bottom-0 z-10 p-6 pb-24 sm:p-12 sm:pb-20">
        <h1
          aria-label={c.aria}
          className="max-w-5xl font-display text-[clamp(3.4rem,10vw,8.5rem)] leading-[0.95] font-extrabold tracking-tight text-white"
        >
          {c.lines.map((line, li) => (
            <span key={li} className="block" aria-hidden="true">
              {line.map((word) => (
                <span
                  key={word}
                  className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0"
                >
                  <span className="hero-word inline-block will-change-transform">
                    {word}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="hero-sub mt-6 max-w-md text-lg leading-relaxed text-white/85 sm:text-xl">
          {c.sub}
        </p>
        <div className="hero-sub mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            to="/request"
            className="cta-underline text-xl text-white sm:text-2xl"
            style={{ color: "white" }}
          >
            Request service
          </Link>
          <Link
            to="/partners"
            className="cta-brackets text-base text-white sm:text-lg"
            style={{ color: "white" }}
          >
            Become a partner
          </Link>
        </div>
      </div>

      <div className="hero-sub absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-center">
        <span className="font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">
          scroll
        </span>
        <span className="mx-auto mt-2 block h-8 w-px animate-pulse bg-white/60" />
      </div>
    </section>
  )
}
