// Canonical service areas, shared by the customer request flow and partner
// service-area settings so matching keys off identical values. These are the
// Ottawa/Gatineau neighborhoods CapitalClear recruits partners in.

export const AREAS = [
  "Kanata",
  "Stittsville",
  "Barrhaven",
  "Nepean",
  "Orléans",
  "Gloucester",
  "Ottawa (central)",
  "Manotick / Greely",
  "Cumberland",
  "Gatineau / Outaouais",
] as const

export type Area = (typeof AREAS)[number]

/** Sentinel the customer can pick when unsure; stored as null (visible to all). */
export const NO_AREA = "Other / not sure"
