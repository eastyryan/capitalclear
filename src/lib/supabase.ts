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

/** Create a request from the customer flow. Returns the new row id (for
    Checkout) or null. Never throws.

    Goes through the create_request() SECURITY DEFINER RPC, which derives the
    price and service_name server-side from the price book and forces
    status/payment/assignment. The `service_name` and `price` fields below are
    kept in the argument shape so existing callers (Request.tsx) need no change,
    but they are IGNORED — the server is authoritative. Direct inserts into
    `requests` are revoked at the database, so this is the only creation path.
    See supabase/migrations/20260725120000_security_hardening.sql. */
export async function submitRequest(row: {
  address: string
  postal_code: string | null
  pin_x: number | null
  pin_y: number | null
  service_id: string
  service_name: string // ignored — server derives it
  scope: string
  price: number // ignored — server derives it
  season: string
  contact: string | null
  area: string | null
}): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc("create_request", {
      p_address: row.address,
      p_service_id: row.service_id,
      p_scope: row.scope,
      p_season: row.season,
      p_postal_code: row.postal_code,
      p_pin_x: row.pin_x,
      p_pin_y: row.pin_y,
      p_contact: row.contact,
      p_area: row.area,
    })
    if (error) {
      console.warn("request insert failed:", error.message)
      return null
    }
    return (data as string) ?? null
  } catch (e) {
    console.warn("request insert failed:", e)
    return null
  }
}
