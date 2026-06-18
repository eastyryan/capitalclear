// CAD money formatting. Money is stored as integer cents everywhere
// (bigint in the DB, number in TS). Never use floats for storage —
// only convert to dollars at the formatting boundary.

export type MoneyLocale = 'en' | 'fr';

/**
 * Format integer cents as a CAD currency string for the given locale.
 * en -> "$45.00", fr -> "45,00 $".
 */
export function formatCAD(cents: number, locale: MoneyLocale = 'en'): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
}

/** Convert integer cents to a dollar number (e.g. 4500 -> 45). */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/** Convert a dollar amount to integer cents, rounding to the nearest cent. */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
