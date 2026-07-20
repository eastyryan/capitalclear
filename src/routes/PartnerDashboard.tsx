import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import SiteHeader from "../components/SiteHeader"
import Footer from "../components/Footer"
import { supabase, type RequestRow } from "../lib/supabase"
import { AREAS } from "../lib/areas"
import { hasStripe, payout, startOnboarding } from "../lib/stripe"
import { useAuth } from "../lib/auth"

function ground(row: RequestRow) {
  return row.season === "summer" ? "yard" : "driveway"
}
function scopeLabel(row: RequestRow) {
  const s = row.scope.charAt(0).toUpperCase() + row.scope.slice(1)
  return `${s} ${ground(row)}`
}

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const { ready, session, partner, signOut, refreshPartner } = useAuth()
  const [rows, setRows] = useState<RequestRow[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [savingAreas, setSavingAreas] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const loaded = useRef(false)

  const connectPayouts = async () => {
    setOnboarding(true)
    const url = await startOnboarding()
    if (url) window.location.href = url
    else {
      setOnboarding(false)
      flash("Payout setup is not available yet.")
    }
  }

  const myAreas = partner?.service_areas ?? []
  const toggleArea = async (a: string) => {
    if (!supabase || !session) return
    const next = myAreas.includes(a)
      ? myAreas.filter((x) => x !== a)
      : [...myAreas, a]
    setSavingAreas(true)
    const { error } = await supabase
      .from("partners")
      .update({ service_areas: next })
      .eq("id", session.user.id)
    setSavingAreas(false)
    if (error) flash(error.message)
    else await refreshPartner()
  }

  useEffect(() => {
    document.title = "CapitalClear partner dashboard"
  }, [])

  // Auth gate.
  useEffect(() => {
    if (ready && !session) navigate("/partners/login", { replace: true })
  }, [ready, session, navigate])

  // Load available + own jobs, then keep them live.
  useEffect(() => {
    if (!supabase || !session || !partner?.approved) return
    const client = supabase
    let active = true

    const load = () =>
      client
        .from("requests")
        .select("*")
        .in("status", ["new", "accepted"])
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (active && data) {
            setRows(data as RequestRow[])
            loaded.current = true
          }
        })
    load()

    const channel = client
      .channel("partner-dash")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        () => load(),
      )
      .subscribe()

    return () => {
      active = false
      void client.removeChannel(channel)
    }
  }, [session, partner?.approved])

  const flash = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2600)
  }

  const act = async (
    id: string,
    rpc: "accept_request" | "decline_request" | "complete_request",
  ) => {
    if (!supabase) return
    const { error } = await supabase.rpc(rpc, { req_id: id })
    if (error) flash(error.message)
    else if (rpc === "complete_request") {
      // Release the 90% to this partner (no-op unless paid + payouts enabled).
      void payout(id)
    } else if (rpc === "accept_request") {
      // Re-fetch to learn whether the claim actually landed (someone may have
      // grabbed it first).
      const { data } = await supabase.from("requests").select("*").eq("id", id).maybeSingle()
      const row = data as RequestRow | null
      if (row && row.assigned_partner !== session?.user.id) {
        flash("Another crew grabbed that one first.")
      }
    }
  }

  if (!ready) {
    return (
      <>
        <SiteHeader current="partners" />
        <main className="grid min-h-[70vh] place-items-center">
          <p className="font-mono text-sm text-ink-soft">Loading your dashboard...</p>
        </main>
      </>
    )
  }

  // Signed in but not yet approved.
  if (session && !partner?.approved) {
    return (
      <>
        <SiteHeader current="partners" />
        <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 pb-20">
          <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
            partner dashboard
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
            You're on the list.
          </h1>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Your account is created and pending approval. We review new partners
            before the season and match you to a neighborhood. We'll email{" "}
            <span className="font-mono text-ink">{partner?.email ?? session.user.email}</span>{" "}
            the moment you're live.
          </p>
          <button
            onClick={() => signOut()}
            className="mt-6 text-left font-mono text-[13px] text-ink-soft transition-colors hover:text-ink"
          >
            Sign out
          </button>
        </main>
        <Footer />
      </>
    )
  }

  const incoming = rows.filter((r) => r.status === "new")
  const mine = rows.filter(
    (r) => r.status === "accepted" && r.assigned_partner === session?.user.id,
  )

  return (
    <>
      <SiteHeader current="partners" />
      <main className="mx-auto max-w-5xl px-6 pt-28 pb-20 sm:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
              {partner?.company || "your dashboard"}
            </p>
            <h1 className="mt-2 text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-5xl">
              Live jobs near you.
            </h1>
          </div>
          <button
            onClick={() => signOut()}
            className="font-mono text-[13px] text-ink-soft transition-colors hover:text-ink"
          >
            Sign out
          </button>
        </div>

        {/* Payouts (only when payments are enabled) */}
        {hasStripe && (
          <section className="mt-12 rounded-3xl border border-line p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Payouts</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {partner?.payouts_enabled
                    ? "Payouts active. You keep 90 percent of every job, paid to your account."
                    : partner?.stripe_account_id
                      ? "Almost there. Finish your Stripe setup to receive payouts."
                      : "Connect a payout account to get paid the 90 percent you keep."}
                </p>
              </div>
              {partner?.payouts_enabled ? (
                <span className="rounded-full bg-accent px-3 py-1 font-mono text-[12px] text-accent-ink">
                  active
                </span>
              ) : (
                <button
                  onClick={connectPayouts}
                  disabled={onboarding}
                  className="press-imprint rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent disabled:opacity-60"
                >
                  {onboarding
                    ? "Opening..."
                    : partner?.stripe_account_id
                      ? "Finish payout setup"
                      : "Set up payouts"}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Service areas */}
        <section className="mt-12 rounded-3xl bg-tint/60 p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold tracking-tight">Your service areas</h2>
            <span className="font-mono text-[12px] text-ink-soft">
              {savingAreas ? "saving..." : myAreas.length === 0 ? "showing all areas" : `${myAreas.length} selected`}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-soft">
            {myAreas.length === 0
              ? "Pick the neighborhoods you cover to get matched jobs. Until you do, you see every area."
              : "You only see new jobs in these neighborhoods."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {AREAS.map((a) => {
              const on = myAreas.includes(a)
              return (
                <button
                  key={a}
                  onClick={() => toggleArea(a)}
                  disabled={savingAreas}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                    on
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-line bg-paper text-ink-soft hover:border-ink/40"
                  }`}
                >
                  {a}
                </button>
              )
            })}
          </div>
        </section>

        {/* Incoming */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <h2 className="text-xl font-bold tracking-tight">Incoming requests</h2>
            <span className="rounded-full bg-accent px-3 py-1 font-mono text-[12px] text-accent-ink">
              live queue
            </span>
          </div>
          {incoming.length === 0 ? (
            <p className="py-8 text-ink-soft">
              {loaded.current
                ? "Queue is clear. New requests appear here the moment a neighbor books."
                : "Loading..."}
            </p>
          ) : (
            <ul>
              {incoming.map((r) => (
                <li
                  key={r.id}
                  className="cc-fade-up flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{r.address}</p>
                    <p className="mt-0.5 font-mono text-[12px] text-ink-soft">
                      {r.service_name} · {scopeLabel(r)}
                      {r.area ? ` · ${r.area}` : ""}
                    </p>
                    {r.contact && (
                      <p className="mt-0.5 font-mono text-[12px] text-accent">{r.contact}</p>
                    )}
                  </div>
                  <span className="font-mono text-lg">${r.price}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => act(r.id, "accept_request")}
                      className="press-imprint rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => act(r.id, "decline_request")}
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* My route */}
        <section className="mt-12">
          <div className="border-b border-line pb-3">
            <h2 className="text-xl font-bold tracking-tight">Your accepted jobs</h2>
          </div>
          {mine.length === 0 ? (
            <p className="py-8 text-ink-soft">Jobs you accept show up here.</p>
          ) : (
            <ul>
              {mine.map((r) => (
                <li
                  key={r.id}
                  className="cc-fade-up flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{r.address}</p>
                    <p className="mt-0.5 font-mono text-[12px] text-ink-soft">
                      {r.service_name} · {scopeLabel(r)}
                      {r.contact ? ` · ${r.contact}` : ""}
                    </p>
                  </div>
                  <span className="font-mono">${r.price}</span>
                  <button
                    onClick={() => act(r.id, "complete_request")}
                    className="press-imprint rounded-full border border-line px-4 py-1.5 text-sm font-semibold transition-colors hover:border-ink"
                  >
                    Mark done
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-12 font-mono text-[12px] text-ink-soft">
          <Link to="/partners" className="text-accent hover:underline">
            See the public demo
          </Link>
        </p>
      </main>

      {toast && (
        <div className="cc-fade-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 font-mono text-[13px] text-paper shadow-lg">
          {toast}
        </div>
      )}
      <Footer />
    </>
  )
}
