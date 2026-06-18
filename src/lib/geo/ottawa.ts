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
