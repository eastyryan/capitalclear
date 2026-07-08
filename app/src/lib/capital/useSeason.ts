import { useEffect } from "react";

import type { Season } from "./data";

/**
 * Winter-first product: the season is pinned. This hook keeps the same call
 * sites but always returns "winter" and re-stamps <html data-season> in case
 * client navigation ever loses it. (Summer support stays in the repo for a
 * later un-pivot; restore the stateful version then.)
 */
export function useSeason(): Season {
  useEffect(() => {
    document.documentElement.dataset.season = "winter";
  }, []);

  return "winter";
}
