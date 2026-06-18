import type { ServiceType } from '@/types/database.types';

// Pricing is computed in integer cents (CAD). Base prices per service plus a
// seasonal winter surge on snow removal during Ottawa's snow months.

/** Base price per service, in integer cents (CAD). */
export const SERVICE_BASE_CENTS: Record<ServiceType, number> = {
  snow_removal: 4500,
  lawn_mowing: 5500,
  seasonal_maintenance: 12000,
};

/** Winter-surge multiplier applied to snow removal in snow months. */
const WINTER_SURGE_MULTIPLIER = 1.1;

/** Months (1-based) considered winter for snow-removal surge pricing. */
const WINTER_MONTHS = new Set([12, 1, 2, 3]);

export interface QuoteLineItem {
  labelKey: string;
  cents: number;
}

export interface Quote {
  baseCents: number;
  surgeMultiplier: number;
  totalCents: number;
  isWinterSurge: boolean;
  lineItems: QuoteLineItem[];
}

/**
 * Compute a price quote for a service, optionally for a scheduled date.
 * Snow removal scheduled in Dec–Mar gets a 1.1x winter surge; the surge is
 * broken out as its own line item so the UI can explain the price.
 */
export function getQuote(
  service: ServiceType,
  scheduledFor?: Date | string | null,
): Quote {
  const baseCents = SERVICE_BASE_CENTS[service];

  const date =
    scheduledFor == null
      ? null
      : scheduledFor instanceof Date
        ? scheduledFor
        : new Date(scheduledFor);

  const month =
    date && !Number.isNaN(date.getTime()) ? date.getMonth() + 1 : null;

  const isWinterSurge =
    service === 'snow_removal' && month !== null && WINTER_MONTHS.has(month);

  const surgeMultiplier = isWinterSurge ? WINTER_SURGE_MULTIPLIER : 1;
  const totalCents = Math.round(baseCents * surgeMultiplier);

  const lineItems: QuoteLineItem[] = [
    { labelKey: 'Pricing.base', cents: baseCents },
  ];

  if (isWinterSurge) {
    lineItems.push({
      labelKey: 'Pricing.winterSurge',
      cents: totalCents - baseCents,
    });
  }

  return { baseCents, surgeMultiplier, totalCents, isWinterSurge, lineItems };
}
