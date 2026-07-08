export type Season = "summer" | "winter";

export type Scope = "small" | "medium" | "large";

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

export const SCOPES: { id: Scope; label: string; multiplier: number }[] = [
  { id: "small", label: "Small", multiplier: 1 },
  { id: "medium", label: "Medium", multiplier: 1.35 },
  { id: "large", label: "Large", multiplier: 1.8 },
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
      basePrice: 52,
      icon: "shovel",
      blurb: "Plowed or cleared to the pavement.",
    },
    {
      id: "snowblow",
      name: "Snow blowing",
      basePrice: 60,
      icon: "snowflake",
      blurb: "Deep snow moved off drive and apron.",
    },
    {
      id: "walkway",
      name: "Walkway and salt",
      basePrice: 38,
      icon: "salt",
      blurb: "Steps and paths shoveled, then salted.",
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
};

export function estimate(service: Service, scope: Scope): number {
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
