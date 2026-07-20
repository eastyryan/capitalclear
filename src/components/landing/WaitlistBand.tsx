import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { submitForm } from "../../lib/forms"
import { joinWaitlist } from "../../lib/waitlist"
import { trackEvent } from "../../lib/analytics"

gsap.registerPlugin(ScrollTrigger)

type Status = "idle" | "sending" | "done" | "error"

export default function WaitlistBand() {
  const root = useRef<HTMLElement>(null)
  const [email, setEmail] = useState("")
  const [zip, setZip] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".wl-item",
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: "top 72%" },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    // Dual-write: Netlify Forms (the user's dashboard) + the owned Supabase
    // list that storm alerts are sent from.
    const [ok] = await Promise.all([
      submitForm("waitlist", { email, zip }),
      joinWaitlist(email, zip),
    ])
    if (ok) {
      setStatus("done")
      trackEvent("waitlist_submit", { zip: zip || "none" })
    } else {
      setStatus("error")
    }
  }

  return (
    <section ref={root} className="border-t border-line bg-paper px-6 py-28 sm:px-12 sm:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="wl-item font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
            launch list
          </p>
          <h2 className="wl-item mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            Be first when it snows.
          </h2>
          <p className="wl-item mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
            We are lining up crews for this winter. Leave your email and we
            will tell you the moment CapitalClear plows in your neighborhood.
          </p>
        </div>

        <div className="wl-item">
          {status === "done" ? (
            <div className="cc-fade-up rounded-3xl bg-tint p-8 text-center sm:p-10">
              <p className="text-2xl font-extrabold tracking-tight">
                You're on the list.
              </p>
              <p className="mt-2 font-mono text-[13px] text-ink-soft">
                we will email you before the first storm
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-3xl bg-tint p-8 sm:p-10">
              <label
                htmlFor="wl-email"
                className="block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
              >
                Email
              </label>
              <input
                id="wl-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-lg outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
              />
              <label
                htmlFor="wl-zip"
                className="mt-4 block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
              >
                ZIP or town <span className="normal-case">(optional)</span>
              </label>
              <input
                id="wl-zip"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="14456"
                autoComplete="postal-code"
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-lg outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="press-imprint mt-6 flex min-h-[56px] w-full items-center justify-between rounded-2xl bg-ink px-6 text-paper transition-colors duration-300 hover:bg-accent disabled:opacity-70"
              >
                <span className="font-mono text-sm">
                  {status === "sending" ? "joining..." : "join the list"}
                </span>
                <span className="text-lg font-bold">
                  Get first in line <span aria-hidden="true">→</span>
                </span>
              </button>
              {status === "error" && (
                <p className="mt-3 text-center text-sm text-ink-soft">
                  That did not go through. Please try again.
                </p>
              )}
              <p className="mt-4 text-center font-mono text-[11px] text-ink-soft">
                No spam. One email when we launch near you.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
