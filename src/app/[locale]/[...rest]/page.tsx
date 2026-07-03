import { notFound } from 'next/navigation';

/**
 * Catch-all for unmatched paths under a locale. Calling notFound() here renders
 * the nearest boundary — our styled `[locale]/not-found.tsx` — instead of
 * Next's bare default 404. Specific routes still win over this catch-all.
 */
export default function CatchAllNotFound() {
  notFound();
}
