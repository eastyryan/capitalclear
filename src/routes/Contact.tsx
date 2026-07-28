import { useEffect, useState } from "react"
import SiteHeader from "../components/SiteHeader"
import Footer from "../components/Footer"
import { submitForm } from "../lib/forms"
import { trackEvent } from "../lib/analytics"
import { SUPPORT_EMAIL } from "../lib/legal"

type Status = "idle" | "sending" | "done" | "error"

const inputCls =
  "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
const labelCls =
  "block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"

const INFO: [string, string][] = [
  ["Email", SUPPORT_EMAIL],
  ["Service area", "National Capital Region, Ontario"],
  ["Hours", "7 days a week · storm response"],
]

export default function Contact() {
  const [fields, setFields] = useState({ name: "", email: "", message: "" })
  const [status, setStatus] = useState<Status>("idle")

  useEffect(() => {
    document.title = "CapitalClear: contact"
  }, [])

  const set =
    (k: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    const ok = await submitForm("contact", fields)
    if (ok) {
      setStatus("done")
      trackEvent("contact_submit", {})
    } else {
      setStatus("error")
    }
  }

  return (
    <>
      <SiteHeader current="about" />
      <main className="bg-paper px-6 pt-28 pb-24 sm:px-12 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <p className="cc-fade-up font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
            contact
          </p>
          <h1
            className="cc-fade-up mt-3 max-w-[16ch] text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl"
            style={{ animationDelay: "0.06s" }}
          >
            Get in touch.
          </h1>
          <p
            className="cc-fade-up mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-soft"
            style={{ animationDelay: "0.12s" }}
          >
            Questions about a booking, your service area, or becoming a partner?
            Send us a note and we will get back to you.
          </p>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px]">
            <div className="cc-fade-up" style={{ animationDelay: "0.18s" }}>
              {status === "done" ? (
                <div className="cc-fade-up rounded-3xl bg-tint p-8 text-center sm:p-10">
                  <p className="text-2xl font-extrabold tracking-tight">
                    Message sent.
                  </p>
                  <p className="mt-2 font-mono text-[13px] text-ink-soft">
                    thanks — we will be in touch shortly
                  </p>
                  <button
                    onClick={() => {
                      setFields({ name: "", email: "", message: "" })
                      setStatus("idle")
                    }}
                    className="press-imprint mt-6 rounded-full border border-line bg-paper px-6 py-2.5 font-semibold transition-colors hover:border-ink/40"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="max-w-2xl">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="ct-name" className={labelCls}>
                        Name
                      </label>
                      <input
                        id="ct-name"
                        type="text"
                        required
                        value={fields.name}
                        onChange={set("name")}
                        placeholder="Sam Ridley"
                        autoComplete="name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="ct-email" className={labelCls}>
                        Email
                      </label>
                      <input
                        id="ct-email"
                        type="email"
                        required
                        value={fields.email}
                        onChange={set("email")}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <label htmlFor="ct-message" className={labelCls}>
                      Message
                    </label>
                    <textarea
                      id="ct-message"
                      required
                      rows={6}
                      value={fields.message}
                      onChange={set("message")}
                      placeholder="How can we help?"
                      className={`${inputCls} resize-y`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="press-imprint mt-8 rounded-full bg-accent px-8 py-3.5 text-lg font-semibold text-accent-ink disabled:opacity-70"
                  >
                    {status === "sending" ? "Sending..." : "Send message"}
                  </button>
                  {status === "error" && (
                    <p className="mt-3 text-sm text-ink-soft">
                      That did not go through. Please try again, or email us at{" "}
                      {SUPPORT_EMAIL}.
                    </p>
                  )}
                </form>
              )}
            </div>

            <aside
              className="cc-fade-up h-fit rounded-3xl bg-tint p-7"
              style={{ animationDelay: "0.26s" }}
            >
              <p className="font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
                Reach us
              </p>
              <dl className="mt-5 divide-y divide-line">
                {INFO.map(([label, value]) => (
                  <div key={label} className="py-4 first:pt-0 last:pb-0">
                    <dt className="font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase">
                      {label}
                    </dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
