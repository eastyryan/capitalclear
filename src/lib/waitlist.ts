import { supabase } from "./supabase"

/** Add someone to the owned (Supabase) waitlist so storm alerts can reach
    them. Ignores duplicates. No-op without Supabase env; never throws. */
export async function joinWaitlist(email: string, town: string): Promise<void> {
  if (!supabase) return
  // Plain insert (not upsert): the anon role has no SELECT on this private
  // list, so upsert's representation read fails. A duplicate email just
  // unique-violates, which we ignore.
  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.trim().toLowerCase(), town: town.trim() || null })
  if (error && error.code !== "23505") {
    console.warn("waitlist insert failed:", error.message)
  }
}
