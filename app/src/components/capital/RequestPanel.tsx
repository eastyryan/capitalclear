import { useState } from "react";

import type { Season } from "../../lib/capital/data";
import { SEASON_COPY } from "../../lib/capital/data";

/**
 * The opening panel (board 1): headline, address entry, and the framed
 * "Set location" block. Sits bottom-left over the aerial plate.
 */
export function RequestPanel({
  season,
  hasPin,
  onConfirm,
}: {
  season: Season;
  hasPin: boolean;
  onConfirm: (address: string) => void;
}) {
  const [address, setAddress] = useState("");
  const [touched, setTouched] = useState(false);
  const copy = SEASON_COPY[season];
  const missing = touched && !address.trim() && !hasPin;

  const submit = () => {
    if (!address.trim() && !hasPin) {
      setTouched(true);
      return;
    }
    onConfirm(address.trim());
  };

  return (
    <div className="pointer-events-auto absolute inset-x-4 bottom-4 max-w-md rounded-xl bg-[var(--cc-paper)] p-6 shadow-xl sm:inset-x-auto sm:left-8 sm:bottom-8 sm:p-8">
      <h1 className="text-4xl font-semibold tracking-tighter">{copy.headline}</h1>
      <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-[var(--cc-ink-soft)]">
        Drop a pin or type your address. A trusted local crew comes to you.
      </p>

      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label
          htmlFor="cc-address"
          className="block font-[family-name:var(--cc-font-mono)] text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]"
        >
          Service address
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="cc-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="41 Birchwood Lane"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-lg border border-[var(--cc-line)] bg-white/70 px-3 py-2.5 text-base outline-none transition-shadow focus:shadow-[0_0_0_2px_var(--cc-accent)]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-[var(--cc-accent)] px-4 py-2.5 text-sm font-medium text-[var(--cc-accent)] transition-colors duration-200 hover:bg-[var(--cc-accent)] hover:text-[var(--cc-accent-ink)] active:translate-y-[1px] motion-reduce:transition-none"
          >
            Set location
          </button>
        </div>
        {missing ? (
          <p className="mt-2 text-xs text-[#a03030]">
            Type an address or tap your driveway on the map.
          </p>
        ) : (
          <p className="mt-3 font-[family-name:var(--cc-font-mono)] text-[11px] text-[var(--cc-ink-soft)]">
            {hasPin ? "Pin set. " : "Or tap your driveway on the map. "}
            Typical arrival: 20 to 30 min.
          </p>
        )}
      </form>
    </div>
  );
}
