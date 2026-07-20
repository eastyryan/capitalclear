import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"
import SiteHeader from "../components/SiteHeader"
import Footer from "../components/Footer"
import Hero from "../components/landing/Hero"
import ClearingScene, { devPose } from "../components/landing/ClearingScene"
import HowItWorks from "../components/landing/HowItWorks"
import Marquee from "../components/landing/Marquee"
import EstimateWidget from "../components/landing/EstimateWidget"
import PartnerBand from "../components/landing/PartnerBand"
import CrewStrip from "../components/landing/CrewStrip"
import WaitlistBand from "../components/landing/WaitlistBand"
import FinalCTA from "../components/landing/FinalCTA"

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
  useEffect(() => {
    document.title = "CapitalClear: snow clearing, on demand"
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({ lerp: 0.11 })
    lenis.on("scroll", ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Some embedded webviews report a zero-height viewport briefly at boot,
    // which poisons ScrollTrigger's cached measurements. Re-measure once the
    // viewport reports real dimensions, and again after full load.
    let tries = 0
    let readyRaf = 0
    const whenViewportReady = () => {
      if (window.innerHeight > 0) {
        ScrollTrigger.refresh()
        return
      }
      if (tries++ < 300) readyRaf = requestAnimationFrame(whenViewportReady)
    }
    readyRaf = requestAnimationFrame(whenViewportReady)
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener("load", onLoad, { once: true })

    return () => {
      cancelAnimationFrame(readyRaf)
      window.removeEventListener("load", onLoad)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <SiteHeader current="about" />
      <main>
        {devPose() === null && <Hero />}
        <ClearingScene />
        <HowItWorks />
        <Marquee />
        <EstimateWidget />
        <PartnerBand />
        <CrewStrip />
        <WaitlistBand />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
