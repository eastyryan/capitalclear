import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "./supabase"

export interface PartnerProfile {
  id: string
  company: string | null
  email: string | null
  phone: string | null
  service_areas: string[]
  approved: boolean
  stripe_account_id: string | null
  payouts_enabled: boolean
}

interface AuthState {
  ready: boolean
  session: Session | null
  partner: PartnerProfile | null
  refreshPartner: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  ready: true,
  session: null,
  partner: null,
  refreshPartner: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!supabase)
  const [session, setSession] = useState<Session | null>(null)
  const [partner, setPartner] = useState<PartnerProfile | null>(null)

  const loadPartner = async (uid: string | undefined) => {
    if (!supabase || !uid) {
      setPartner(null)
      return
    }
    const { data } = await supabase
      .from("partners")
      .select("*")
      .eq("id", uid)
      .maybeSingle()
    setPartner((data as PartnerProfile) ?? null)
  }

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true

    client.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      await loadPartner(data.session?.user.id)
      setReady(true)
    })

    const { data: sub } = client.auth.onAuthStateChange(async (_e, s) => {
      setSession(s)
      await loadPartner(s?.user.id)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value: AuthState = {
    ready,
    session,
    partner,
    refreshPartner: () => loadPartner(session?.user.id),
    signOut: async () => {
      await supabase?.auth.signOut()
      setPartner(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
