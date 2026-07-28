import { useEffect } from "react"
import { Link } from "react-router-dom"
import SiteHeader from "../components/SiteHeader"
import Footer from "../components/Footer"
import type { LegalDoc } from "../lib/legal"

/** Prose page for the legal documents. Same grammar as /partners: mono eyebrow,
    oversized tight headline, hairline-divided sections, numbered in accent. */
export default function Legal({ doc }: { doc: LegalDoc }) {
  useEffect(() => {
    document.title = `CapitalClear: ${doc.title.toLowerCase()}`
  }, [doc.title])

  return (
    <>
      <SiteHeader current="about" />
      <main className="bg-paper px-6 pt-28 pb-24 sm:px-12 sm:pt-36">
        <div className="mx-auto max-w-3xl">
          <p className="cc-fade-up font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
            {doc.eyebrow}
          </p>
          <h1
            className="cc-fade-up mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl"
            style={{ animationDelay: "0.06s" }}
          >
            {doc.title}
          </h1>
          <p
            className="cc-fade-up mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-soft"
            style={{ animationDelay: "0.12s" }}
          >
            {doc.intro}
          </p>

          <p
            className="cc-fade-up mt-10 border-b border-line pb-5 font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
            style={{ animationDelay: "0.18s" }}
          >
            {doc.effective}
          </p>

          <div className="divide-y divide-line">
            {doc.sections.map((section, i) => (
              <section key={section.heading} className="py-8 last:pb-0">
                <h2 className="flex items-baseline gap-3 text-xl font-extrabold tracking-tight sm:text-2xl">
                  <span className="font-mono text-sm font-normal tracking-normal text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.body.map((p) => (
                    <p
                      key={p.slice(0, 32)}
                      className="max-w-[65ch] text-[15px] leading-relaxed text-ink-soft"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-14 font-mono text-[12px] text-ink-soft">
            Questions?{" "}
            <Link to="/contact" className="text-accent hover:underline">
              Get in touch
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
