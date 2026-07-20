import { useState } from "react"
import { submitForm } from "../../lib/forms"
import { trackEvent } from "../../lib/analytics"

type Status = "idle" | "sending" | "done" | "error"

const TRUCK_OPTIONS = ["1", "2-5", "6+"]

const inputCls =
  "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
const labelCls =
  "block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"

export default function PartnerApplyForm() {
  const [fields, setFields] = useState({
    company: "",
    contact: "",
    email: "",
    phone: "",
    area: "",
    trucks: "1",
  })
  const [status, setStatus] = useState<Status>("idle")

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    const ok = await submitForm("partner-application", fields)
    if (ok) {
      setStatus("done")
      trackEvent("partner_apply_submit", { trucks: fields.trucks })
    } else {
      setStatus("error")
    }
  }

  return (
    <section id="apply" className="mt-20 scroll-mt-24 border-t border-line pt-14">
      <div className="max-w-2xl">
        <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
          partner application
        </p>
        <h2 className="mt-3 text-3xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
          Run your plow route with us.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Tell us about your company and we will reach out before the season
          starts. You keep 90 percent of every job, no lead fees.
        </p>
      </div>

      {status === "done" ? (
        <div className="cc-fade-up mt-10 max-w-2xl rounded-3xl bg-tint p-8 text-center sm:p-10">
          <p className="text-2xl font-extrabold tracking-tight">
            Application received.
          </p>
          <p className="mt-2 font-mono text-[13px] text-ink-soft">
            we will be in touch before the first snowfall
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 max-w-2xl">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pa-company" className={labelCls}>
                Company name
              </label>
              <input
                id="pa-company"
                type="text"
                required
                value={fields.company}
                onChange={set("company")}
                placeholder="Summit Snow Co"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pa-contact" className={labelCls}>
                Contact name
              </label>
              <input
                id="pa-contact"
                type="text"
                required
                value={fields.contact}
                onChange={set("contact")}
                placeholder="Sam Ridley"
                autoComplete="name"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pa-email" className={labelCls}>
                Email
              </label>
              <input
                id="pa-email"
                type="email"
                required
                value={fields.email}
                onChange={set("email")}
                placeholder="dispatch@summitsnow.co"
                autoComplete="email"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pa-phone" className={labelCls}>
                Phone <span className="normal-case">(optional)</span>
              </label>
              <input
                id="pa-phone"
                type="tel"
                value={fields.phone}
                onChange={set("phone")}
                placeholder="(315) 555-0142"
                autoComplete="tel"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pa-area" className={labelCls}>
                Service area
              </label>
              <input
                id="pa-area"
                type="text"
                required
                value={fields.area}
                onChange={set("area")}
                placeholder="Geneva and Ontario County"
                className={inputCls}
              />
            </div>
            <div>
              <span className={labelCls}>Plow trucks</span>
              <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Plow trucks">
                {TRUCK_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={fields.trucks === opt}
                    onClick={() => setFields((f) => ({ ...f, trucks: opt }))}
                    className={`min-h-[46px] flex-1 rounded-xl border font-mono text-sm transition-colors ${
                      fields.trucks === opt
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-line bg-white text-ink-soft hover:border-ink/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="press-imprint mt-8 rounded-full bg-accent px-8 py-3.5 text-lg font-semibold text-accent-ink disabled:opacity-70"
          >
            {status === "sending" ? "Sending..." : "Apply to partner"}
          </button>
          {status === "error" && (
            <p className="mt-3 text-sm text-ink-soft">
              That did not go through. Please try again.
            </p>
          )}
        </form>
      )}
    </section>
  )
}
