import { supabase } from "./supabase"

// Payments are optional infrastructure: without VITE_STRIPE_ENABLED the whole
// product runs exactly as the simulated demo.
export const hasStripe = import.meta.env.VITE_STRIPE_ENABLED === "true"

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL ?? ""}/functions/v1`
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

async function authHeader(): Promise<Record<string, string>> {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Hosted Checkout for a request. Returns the URL to redirect to, or null. */
export async function startCheckout(requestId: string): Promise<string | null> {
  if (!hasStripe || !ANON) return null
  try {
    const res = await fetch(`${FN_BASE}/stripe-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({ request_id: requestId }),
    })
    const body = await res.json()
    return body.url ?? null
  } catch (e) {
    console.warn("checkout failed:", e)
    return null
  }
}

/** Partner Connect onboarding. Returns the Stripe onboarding URL, or null. */
export async function startOnboarding(): Promise<string | null> {
  if (!hasStripe) return null
  try {
    const res = await fetch(`${FN_BASE}/stripe-onboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
    })
    const body = await res.json()
    return body.url ?? null
  } catch (e) {
    console.warn("onboarding failed:", e)
    return null
  }
}

/** Trigger the 90% transfer for a completed, paid job. Fire-and-forget. */
export async function payout(requestId: string): Promise<void> {
  if (!hasStripe) return
  try {
    await fetch(`${FN_BASE}/stripe-payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ request_id: requestId }),
    })
  } catch (e) {
    console.warn("payout failed:", e)
  }
}
