// Service-area geofencing by Forward Sortation Area (FSA — first 3 chars of a
// Canadian postal code). Capital Clear only operates in Ottawa and its
// surrounding communities, so we gate jobs at intake by FSA.

/** Ottawa-area FSAs we currently service. */
export const OTTAWA_FSAS: string[] = [
  'K1A', 'K1B', 'K1C', 'K1G', 'K1H', 'K1J', 'K1K', 'K1L', 'K1M', 'K1N',
  'K1P', 'K1R', 'K1S', 'K1T', 'K1V', 'K1W', 'K1X', 'K1Y', 'K1Z',
  'K2A', 'K2B', 'K2C', 'K2E', 'K2G', 'K2H', 'K2J', 'K2K', 'K2L', 'K2M',
  'K2P', 'K2R', 'K2S', 'K2T', 'K2V', 'K2W',
  'K4A', 'K4B', 'K4C', 'K0A', 'K4M', 'K4P', 'K4R',
];

/** Human-readable communities inside the service area (for marketing copy). */
export const SERVICE_AREA_NAMES = [
  'Ottawa',
  'Kanata',
  'Barrhaven',
  'Orleans',
  'Nepean',
  'Gloucester',
  'Stittsville',
] as const;

/**
 * Normalize a raw postal-code input: uppercase, then strip everything that
 * isn't a letter or digit (spaces, dashes, punctuation). "k1a 0b1" -> "K1A0B1".
 */
export function normalizePostal(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Extract the FSA (first three characters) from a postal code. */
export function fsaOf(postal: string): string {
  return normalizePostal(postal).slice(0, 3);
}

/** True if the postal code falls within an Ottawa-area FSA. */
export function isOttawaPostal(postal: string): boolean {
  return OTTAWA_FSAS.includes(fsaOf(postal));
}

/**
 * Throw OUT_OF_AREA if the postal code is outside the Ottawa service area.
 * Callers map this error to a localized user message.
 */
export function assertOttawaPostal(postal: string): void {
  if (!isOttawaPostal(postal)) {
    throw new Error('OUT_OF_AREA');
  }
}

/**
 * FSA -> neighbourhood label. Gives jobs a human place name ("The Glebe",
 * "Barrhaven") from the postal code alone, without pro geolocation.
 */
export const FSA_NEIGHBOURHOODS: Record<string, string> = {
  K1A: 'Downtown (Parliament)',
  K1B: 'Blackburn Hamlet',
  K1C: 'Orléans',
  K1G: 'Alta Vista / Riverview',
  K1H: 'Alta Vista',
  K1J: 'Beacon Hill',
  K1K: 'Overbrook',
  K1L: 'Vanier',
  K1M: 'Rockcliffe Park',
  K1N: 'ByWard Market / Sandy Hill',
  K1P: 'Downtown',
  K1R: 'Centretown West',
  K1S: 'The Glebe / Old Ottawa South',
  K1T: 'Greenboro / South Keys',
  K1V: 'Hunt Club / Riverside',
  K1W: 'Orléans (Chapel Hill)',
  K1X: 'Leitrim',
  K1Y: 'Hintonburg / Civic Hospital',
  K1Z: 'Westboro / Carlington',
  K2A: 'Highland Park / McKellar',
  K2B: 'Britannia / Bayshore',
  K2C: 'Carleton Heights',
  K2E: 'Fisher Heights',
  K2G: 'Centrepointe',
  K2H: 'Bells Corners',
  K2J: 'Barrhaven',
  K2K: 'Kanata North',
  K2L: 'Kanata (Glen Cairn)',
  K2M: 'Kanata (Bridlewood)',
  K2P: 'Centretown',
  K2R: 'Barrhaven South',
  K2S: 'Stittsville',
  K2T: 'Kanata (Beaverbrook)',
  K2V: 'Kanata (Hazeldean)',
  K2W: 'Kanata North',
  K4A: 'Orléans (Fallingbrook)',
  K4B: 'Navan',
  K4C: 'Cumberland',
  K0A: 'Rural Ottawa',
  K4M: 'Manotick',
  K4P: 'Greely',
  K4R: 'Rural Ottawa (Russell)',
};

/** Neighbourhood for a postal code, or null when the FSA is unknown. */
export function neighbourhoodOf(postal: string | null | undefined): string | null {
  if (!postal) return null;
  return FSA_NEIGHBOURHOODS[fsaOf(postal)] ?? null;
}
