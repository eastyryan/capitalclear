import type { ServiceType } from '@/types/database.types';

/**
 * URL-facing service slugs (kebab-case) mapped to the canonical database
 * ServiceType (snake_case). Used by /services/[slug] and any deep links.
 */
export const SERVICE_SLUGS = {
  'snow-removal': 'snow_removal'
} as const satisfies Record<string, ServiceType>;

export type ServiceSlug = keyof typeof SERVICE_SLUGS;

export const ALL_SERVICE_SLUGS = Object.keys(SERVICE_SLUGS) as ServiceSlug[];

export function isServiceSlug(value: string): value is ServiceSlug {
  return value in SERVICE_SLUGS;
}
