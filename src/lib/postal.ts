// Canadian postal-code helpers. Territory routing keys off the FSA (Forward
// Sortation Area = the first three characters of a postal code, e.g. "K2K").
//
// The authoritative list of serviceable FSAs lives in the `service_fsa` table
// in the database, and create_request() rejects anything outside it. This
// module only NORMALIZES and validates FORMAT, on purpose — so coverage has a
// single source of truth (the DB) instead of a hardcoded list drifting out of
// sync on the client.

// First char excludes D, F, I, O, Q, U; later letter positions exclude D, F,
// I, O, Q, U, W, Z — the standard Canada Post alphabet.
const POSTAL_RE = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/

/** Uppercase, strip everything that isn't a letter or digit. */
export function normalizePostal(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

/** The FSA (first three chars) of a postal code — the territory key. */
export function fsaOf(input: string): string {
  return normalizePostal(input).slice(0, 3)
}

/** True when the string is a well-formed Canadian postal code (FORMAT only —
    says nothing about whether we service it; the DB decides that). */
export function isValidPostalFormat(input: string): boolean {
  return POSTAL_RE.test(normalizePostal(input))
}

/** Display form, e.g. "K2K 2X8". */
export function formatPostal(input: string): string {
  const n = normalizePostal(input)
  return n.length > 3 ? `${n.slice(0, 3)} ${n.slice(3, 6)}` : n
}
