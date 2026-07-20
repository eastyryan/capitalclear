import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import SiteHeader from "../components/SiteHeader"
import Footer from "../components/Footer"
import { hasSupabase, supabase } from "../lib/supabase"
import { useAuth } from "../lib/auth"

export default function PartnerLogin() {
  const navigate = useNavigate()
  const { session, ready } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = "CapitalClear partner sign in"
  }, [])

  // Already signed in: go straight to the dashboard.
  useEffect(() => {
    if (ready && session) navigate("/partners/dashboard", { replace: true })
  }, [ready, session, navigate])

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !email.trim()) return
    setBusy(true)
    setError(null)

    if (usePassword) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      setBusy(false)
      if (error) setError(error.message)
      else navigate("/partners/dashboard", { replace: true })
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/partners/dashboard` },
    })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <>
      <SiteHeader current="partners" />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 pt-28 pb-20">
        <p className="font-mono text-[12px] tracking-[0.18em] text-ink-soft uppercase">
          partner sign in
        </p>
        <h1 className="mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight">
          Your jobs, your crew.
        </h1>

        {!hasSupabase ? (
          <p className="mt-6 text-ink-soft">
            Partner accounts are not enabled in this environment.
          </p>
        ) : sent ? (
          <div className="cc-fade-up mt-8 rounded-2xl border border-line bg-tint/50 p-6">
            <p className="font-bold">Check your email.</p>
            <p className="mt-1.5 text-sm text-ink-soft">
              We sent a sign-in link to{" "}
              <span className="font-mono text-ink">{email}</span>. Open it on
              this device to reach your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={sendLink} className="mt-8">
            <label
              htmlFor="email"
              className="block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcompany.ca"
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-lg outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
            />
            {usePassword && (
              <>
                <label
                  htmlFor="password"
                  className="mt-4 block font-mono text-[11px] tracking-[0.16em] text-ink-soft uppercase"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-lg outline-none transition-colors focus:border-accent"
                />
              </>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="press-imprint mt-4 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-ink text-lg font-bold text-paper transition-colors duration-300 hover:bg-accent disabled:opacity-60"
            >
              {busy ? "Signing in..." : usePassword ? "Sign in" : "Email me a sign-in link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setUsePassword((v) => !v)
                setError(null)
              }}
              className="mt-3 w-full text-center text-sm text-ink-soft transition-colors hover:text-accent"
            >
              {usePassword ? "Use a one-tap email link instead" : "Sign in with a password"}
            </button>
          </form>
        )}

        <p className="mt-8 font-mono text-[12px] text-ink-soft">
          Not a partner yet?{" "}
          <Link to="/partners#apply" className="text-accent hover:underline">
            Apply to join
          </Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
