import type { ServiceType } from '@/types/database.types';

// Pricing is computed in integer cents (CAD). Base prices per service plus a
// seasonal winter surge on snow removal during Ottawa's snow months.

/** Base price per service, in integer cents (CAD). */
export const SERVICE_BASE_CENTS: Record<ServiceType, number> = {
  snow_removal: 4500,
  lawn_mowing: 5500,
  seasonal_maintenance: 12000,
};

// ---- Snow-removal packages ------------------------------------------------
// The bookable snow-removal tiers. Driveway size sets the base price; the
// walkway is an optional add-on that stacks on top.

export type DrivewaySize = 'single' | 'double';

/** Base price per driveway size, in integer cents (CAD). */
export const DRIVEWAY_BASE_CENTS: Record<DrivewaySize, number> = {
  single: 4500,
  double: 5500,
};

/** Walkway + steps add-on, in integer cents (CAD). */
export const WALKWAY_ADDON_CENTS = 2500;

export interface SnowPackage {
  size: DrivewaySize;
  walkway: boolean;
}

/** Pre-surge base for a snow package (driveway + optional walkway). */
export function snowPackageBaseCents({ size, walkway }: SnowPackage): number {
  return DRIVEWAY_BASE_CENTS[size] + (walkway ? WALKWAY_ADDON_CENTS : 0);
}

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
  return buildQuote(
    SERVICE_BASE_CENTS[service],
    service === 'snow_removal',
    scheduledFor,
  );
}

/**
 * Quote a snow-removal package (driveway size + optional walkway add-on).
 * Same winter-surge rules as getQuote, priced off the package base.
 */
export function getSnowQuote(
  pkg: SnowPackage,
  scheduledFor?: Date | string | null,
): Quote {
  return buildQuote(snowPackageBaseCents(pkg), true, scheduledFor);
}

/** Shared surge math for the quote builders. */
function buildQuote(
  baseCents: number,
  surgeEligible: boolean,
  scheduledFor?: Date | string | null,
): Quote {
  const date =
    scheduledFor == null
      ? null
      : scheduledFor instanceof Date
        ? scheduledFor
        : new Date(scheduledFor);

  const month =
    date && !Number.isNaN(date.getTime()) ? date.getMonth() + 1 : null;

  const isWinterSurge =
    surgeEligible && month !== null && WINTER_MONTHS.has(month);

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
