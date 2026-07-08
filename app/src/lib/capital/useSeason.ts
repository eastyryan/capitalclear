import { useEffect, useState } from "react";

import type { Season } from "./data";
import { seasonForMonth } from "./data";

/**
 * Shared season state for every route: initialized from the current month
 * (matching the SSR value the root shell renders) and mirrored onto
 * <html data-season> so the token layer crossfades with the toggle.
 */
export function useSeason() {
  const [season, setSeason] = useState<Season>(() => seasonForMonth(new Date().getMonth()));

  useEffect(() => {
    document.documentElement.dataset.season = season;
  }, [season]);

  return [season, setSeason] as const;
}
