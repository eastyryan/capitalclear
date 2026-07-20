// CapitalClear demo data. Transcribed verbatim from the original build,
// both seasonal sets, so the redesign keeps the exact same product facts.

export type Season = "winter" | "summer"

export type ScopeId = "small" | "medium" | "large"

export const SCOPES: { id: ScopeId; label: string; mult: number }[] = [
  { id: "small", label: "Small", mult: 1 },
  { id: "medium", label: "Medium", mult: 1.35 },
  { id: "large", label: "Large", mult: 1.8 },
]

export type IconId =
  | "mower"
  | "hedge"
  | "edger"
  | "sprinkler"
  | "snowflake"
  | "shovel"
  | "salt"
  | "pin"

export interface Service {
  id: string
  name: string
  base: number
  icon: IconId
  blurb: string
}

export const SERVICES: Record<Season, Service[]> = {
  summer: [
    {
      id: "mowing",
      name: "Lawn mowing",
      base: 48,
      icon: "mower",
      blurb: "Cut, stripe, and clippings handled.",
    },
    {
      id: "hedge",
      name: "Hedge trimming",
      base: 65,
      icon: "hedge",
      blurb: "Shaped hedges and shrubs, haul-away included.",
    },
    {
      id: "edging",
      name: "Edging and cleanup",
      base: 55,
      icon: "edger",
      blurb: "Crisp borders, beds tidied, walkways blown clean.",
    },
  ],
  winter: [
    {
      id: "driveway",
      name: "Driveway clearing",
      base: 52,
      icon: "shovel",
      blurb: "Plowed or cleared to the pavement.",
    },
    {
      id: "snowblow",
      name: "Snow blowing",
      base: 60,
      icon: "snowflake",
      blurb: "Deep snow moved off drive and apron.",
    },
    {
      id: "walkway",
      name: "Walkway and salt",
      base: 38,
      icon: "salt",
      blurb: "Steps and paths shoveled, then salted.",
    },
  ],
}

export function scopeMult(scope: ScopeId): number {
  return SCOPES.find((s) => s.id === scope)?.mult ?? 1
}

export function priceFor(service: Service, scope: ScopeId): number {
  return Math.round(service.base * scopeMult(scope))
}

export interface Provider {
  id: string
  name: string
  monogram: string
  rating: number
  jobs: number
  etaMin: number
  photo: string
  priceDelta: number
}

export const PROVIDERS: Record<Season, Provider[]> = {
  summer: [
    {
      id: "maple-ridge",
      name: "Maple Ridge Lawn Co",
      monogram: "MR",
      rating: 4.9,
      jobs: 312,
      etaMin: 18,
      photo: "/assets/crew-mowing.webp",
      priceDelta: 0,
    },
    {
      id: "green-care",
      name: "Green Care Pros",
      monogram: "GC",
      rating: 4.8,
      jobs: 254,
      etaMin: 22,
      photo: "/assets/crew-robot.webp",
      priceDelta: 4,
    },
    {
      id: "sunrise",
      name: "Sunrise Landscaping",
      monogram: "SL",
      rating: 4.7,
      jobs: 198,
      etaMin: 25,
      photo: "/assets/crew-truck.webp",
      priceDelta: -3,
    },
  ],
  winter: [
    {
      id: "summit-snow",
      name: "Summit Snow Co",
      monogram: "SS",
      rating: 4.9,
      jobs: 421,
      etaMin: 12,
      photo: "/assets/crew-plow.webp",
      priceDelta: 0,
    },
    {
      id: "north-ridge",
      name: "North Ridge Plowing",
      monogram: "NR",
      rating: 4.8,
      jobs: 287,
      etaMin: 16,
      photo: "/assets/crew-blower.webp",
      priceDelta: 5,
    },
    {
      id: "blue-spruce",
      name: "Blue Spruce Snow",
      monogram: "BS",
      rating: 4.7,
      jobs: 166,
      etaMin: 21,
      photo: "/assets/crew-salt.webp",
      priceDelta: -4,
    },
  ],
}

export function providerPrice(basePrice: number, provider: Provider): number {
  return Math.max(15, basePrice + provider.priceDelta)
}

export interface TrackStage {
  id: "enroute" | "arrived" | "working" | "done"
  label: Record<Season, string>
  icon: Record<Season, IconId>
}

export const TRACK_STAGES: TrackStage[] = [
  { id: "enroute", label: { summer: "En route", winter: "En route" }, icon: { summer: "pin", winter: "pin" } },
  { id: "arrived", label: { summer: "Arrived", winter: "Arrived" }, icon: { summer: "pin", winter: "pin" } },
  {
    id: "working",
    label: { summer: "Mowing in progress", winter: "Clearing driveway" },
    icon: { summer: "mower", winter: "shovel" },
  },
  { id: "done", label: { summer: "Done", winter: "Done" }, icon: { summer: "sprinkler", winter: "snowflake" } },
]

export const SEASON_COPY: Record<
  Season,
  {
    headline: string
    doneLine: string
    sizeLabel: string
    tapHint: string
    receiptCta: string
    receiptMicroline: string
    vehicle: string
    weather: string
  }
> = {
  summer: {
    headline: "Your yard, handled.",
    doneLine: "Lawn looks sharp.",
    sizeLabel: "Yard size",
    tapHint: "Or tap your yard on the map above.",
    receiptCta: "Book another visit",
    receiptMicroline: "Yard overgrown again? It takes one tap.",
    vehicle: "Crew truck 17",
    weather: "Sunny, 78F",
  },
  winter: {
    headline: "Your driveway, cleared.",
    doneLine: "Cleared to the pavement.",
    sizeLabel: "Driveway size",
    tapHint: "Or tap your driveway on the map above.",
    receiptCta: "Book another clearing",
    receiptMicroline: "Snowed in again? It takes one tap.",
    vehicle: "Plow truck 42",
    weather: "Light snow, 28F",
  },
}

// Partner dashboard data (both seasonal sets, verbatim).
export interface IncomingRequest {
  id: string
  address: string
  service: string
  scope: string
  distanceMi: number
  price: number
}

export const PARTNER_INCOMING: Record<Season, IncomingRequest[]> = {
  summer: [
    { id: "s1", address: "41 Birchwood Lane", service: "Lawn mowing", scope: "Medium yard", distanceMi: 1.2, price: 65 },
    { id: "s2", address: "18 Court Street", service: "Hedge trimming", scope: "Large yard", distanceMi: 2.4, price: 88 },
    { id: "s3", address: "7 Meadow Drive", service: "Edging and cleanup", scope: "Small yard", distanceMi: 0.8, price: 55 },
  ],
  winter: [
    { id: "w1", address: "41 Birchwood Lane", service: "Driveway clearing", scope: "Medium driveway", distanceMi: 1.2, price: 70 },
    { id: "w2", address: "230 Lakeview Road", service: "Snow blowing", scope: "Large driveway", distanceMi: 3.1, price: 81 },
    { id: "w3", address: "12 Orchard Court", service: "Walkway and salt", scope: "Small walkway", distanceMi: 1.6, price: 51 },
  ],
}

export type RouteStatus = "done" | "in progress" | "scheduled"

export interface RouteStop {
  id: string
  time: string
  address: string
  service: string
  price: number
  status: RouteStatus
}

export const PARTNER_ROUTE: Record<Season, RouteStop[]> = {
  summer: [
    { id: "sr1", time: "9:00 AM", address: "95 Elm Street", service: "Lawn mowing", price: 48, status: "done" },
    { id: "sr2", time: "11:30 AM", address: "12 Hillcrest Avenue", service: "Hedge trimming", price: 65, status: "in progress" },
  ],
  winter: [
    { id: "wr1", time: "6:30 AM", address: "95 Elm Street", service: "Driveway clearing", price: 52, status: "done" },
    { id: "wr2", time: "8:15 AM", address: "12 Hillcrest Avenue", service: "Snow blowing", price: 60, status: "in progress" },
  ],
}

export const PARTNER_EARNINGS: Record<
  Season,
  { weekTotal: number; afterFee: number; days: [string, number][] }
> = {
  summer: {
    weekTotal: 1284,
    afterFee: 1156,
    days: [
      ["Mon", 210],
      ["Tue", 305],
      ["Wed", 188],
      ["Thu", 342],
      ["Fri", 239],
    ],
  },
  winter: {
    weekTotal: 1730,
    afterFee: 1557,
    days: [
      ["Mon", 412],
      ["Tue", 285],
      ["Wed", 496],
      ["Thu", 224],
      ["Fri", 313],
    ],
  },
}

export const DEMO_LINE = "Demo with sample providers"
