import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// The booking queue is optional infrastructure: without the env vars the
// site runs exactly as the simulated demo.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

export const hasSupabase = supabase !== null

export interface RequestRow {
  id: string
  created_at: string
  address: string
  pin_x: number | null
  pin_y: number | null
  service_id: string
  service_name: string
  scope: string
  price: number
  season: string
  status: "new" | "accepted" | "declined" | "done"
  contact: string | null
  assigned_partner: string | null
  area: string | null
  payment_status: "unpaid" | "paid" | "refunded"
  paid_amount: number | null
}

/** Insert a request from the customer flow. Returns the new row id (for
    Checkout) or null. Never throws. */
export async function submitRequest(row: {
  address: string
  pin_x: number | null
  pin_y: number | null
  service_id: string
  service_name: string
  scope: string
  price: number
  season: string
  contact: string | null
  area: string | null
}): Promise<string | null> {
  if (!supabase) return null
  // Generate the id client-side so we know it without reading the row back
  // (anonymous homeowners have no SELECT permission on the locked-down queue).
  const id = crypto.randomUUID()
  try {
    const { error } = await supabase.from("requests").insert({ id, ...row })
    if (error) {
      console.warn("request insert failed:", error.message)
      return null
    }
    return id
  } catch (e) {
    console.warn("request insert failed:", e)
    return null
  }
}
