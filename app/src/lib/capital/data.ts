export type Season = "summer" | "winter";

/** Winter driveway size. Single/Double set the base price on the live site. */
export type Scope = "single" | "double";

export type Step = "locate" | "services" | "match" | "track" | "done";

export type TrackStage = "enroute" | "arrived" | "working" | "done";

export interface Service {
  id: string;
  name: string;
  basePrice: number;
  icon: string; // key into the generated icon sheet
  blurb: string;
}

export interface Provider {
  id: string;
  name: string;
  monogram: string;
  rating: number;
  jobs: number;
  etaMin: number;
  photo: string;
  priceDelta: number; // provider-specific price adjustment in dollars
}

// ---- Capital Clear winter pricing (matches the live site) -----------------
// Driveway size sets the base price; the walkway and Priority Premium are flat
// add-ons. All figures in whole CAD dollars.
export const DRIVEWAY_PRICE: Record<Scope, number> = { single: 45, double: 55 };
/** Walkway + steps add-on. */
export const WALKWAY_ADDON = 25;
/** Priority Premium — flat one-time fee (priority dispatch during storms). */
export const PREMIUM_FLAT = 10;
/** Ontario HST applied to the pre-tax subtotal at checkout. */
export const HST_RATE = 0.13;
/** Capital Clear platform fee: the Pro keeps 85%, Capital Clear keeps 15%. */
export const PLATFORM_FEE = 0.15;

export const SCOPES: { id: Scope; label: string; multiplier: number }[] = [
  { id: "single", label: "Single", multiplier: 1 },
  { id: "double", label: "Double", multiplier: DRIVEWAY_PRICE.double / DRIVEWAY_PRICE.single },
];

export const SERVICES: Record<Season, Service[]> = {
  summer: [
    {
      id: "mowing",
      name: "Lawn mowing",
      basePrice: 48,
      icon: "mower",
      blurb: "Cut, stripe, and clippings handled.",
    },
    {
      id: "hedge",
      name: "Hedge trimming",
      basePrice: 65,
      icon: "hedge",
      blurb: "Shaped hedges and shrubs, haul-away included.",
    },
    {
      id: "edging",
      name: "Edging and cleanup",
      basePrice: 55,
      icon: "edger",
      blurb: "Crisp borders, beds tidied, walkways blown clean.",
    },
  ],
  winter: [
    {
      id: "driveway",
      name: "Driveway clearing",
      basePrice: DRIVEWAY_PRICE.single,
      icon: "shovel",
      blurb: "Plowed or cleared to the pavement.",
    },
    {
      id: "walkway",
      name: "Walkway",
      basePrice: WALKWAY_ADDON,
      icon: "salt",
      blurb: "Steps and paths cleared alongside your driveway.",
    },
    {
      id: "premium",
      name: "Priority Premium",
      basePrice: PREMIUM_FLAT,
      icon: "snowflake",
      blurb: "Dispatched ahead of standard bookings during storms.",
    },
  ],
};

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
      priceDelta: 0,
    },
    {
      id: "blue-spruce",
      name: "Blue Spruce Snow",
      monogram: "BS",
      rating: 4.7,
      jobs: 166,
      etaMin: 21,
      photo: "/assets/crew-salt.webp",
      priceDelta: 0,
    },
  ],
};

export function estimate(service: Service, scope: Scope): number {
  // Winter: driveway is priced by size; the walkway and Priority Premium are
  // flat add-ons. Everything else (summer) keeps the scope multiplier.
  if (service.id === "driveway") return DRIVEWAY_PRICE[scope] ?? DRIVEWAY_PRICE.single;
  if (service.id === "walkway" || service.id === "premium") return service.basePrice;
  const m = SCOPES.find((s) => s.id === scope)?.multiplier ?? 1;
  return Math.round(service.basePrice * m);
}

export function providerPrice(base: number, p: Provider): number {
  return Math.max(15, base + p.priceDelta);
}

export const SEASON_COPY: Record<
  Season,
  { headline: string; services: string; offSeason: string; doneLine: string }
> = {
  summer: {
    headline: "Your yard, handled.",
    services: "Summer services",
    offSeason: "Winter services",
    doneLine: "Lawn looks sharp.",
  },
  winter: {
    headline: "Your driveway, cleared.",
    services: "Winter services",
    offSeason: "Summer services",
    doneLine: "Cleared to the pavement.",
  },
};

/** November through March reads as winter; the rest is summer mode. */
export function seasonForMonth(month: number): Season {
  return month >= 10 || month <= 2 ? "winter" : "summer";
}

export const TRACK_STAGES: { id: TrackStage; label: Record<Season, string> }[] = [
  { id: "enroute", label: { summer: "En route", winter: "En route" } },
  { id: "arrived", label: { summer: "Arrived", winter: "Arrived" } },
  {
    id: "working",
    label: { summer: "Mowing in progress", winter: "Clearing driveway" },
  },
  { id: "done", label: { summer: "Done", winter: "Done" } },
];
