import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Season } from "./data"

const KEY = "cc-season"

const SeasonContext = createContext<{
  season: Season
  setSeason: (s: Season) => void
}>({ season: "winter", setSeason: () => {} })

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>(() => {
    if (typeof window === "undefined") return "winter"
    const stored = window.localStorage.getItem(KEY)
    return stored === "summer" ? "summer" : "winter"
  })

  useEffect(() => {
    document.documentElement.dataset.season = season
    window.localStorage.setItem(KEY, season)
  }, [season])

  return (
    <SeasonContext.Provider value={{ season, setSeason }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  return useContext(SeasonContext)
}
