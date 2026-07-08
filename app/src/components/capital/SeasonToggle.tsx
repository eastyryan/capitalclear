import type { Season } from "../../lib/capital/data";

/**
 * The season switch: the binary-toggle garment. Flipping it crossfades the
 * whole product between the summer and winter grades.
 */
export function SeasonToggle({
  season,
  onChange,
}: {
  season: Season;
  onChange: (s: Season) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Season"
      className="relative flex items-center rounded-full border border-[var(--cc-line)] bg-[var(--cc-paper)]/90 p-1 shadow-sm backdrop-blur-sm"
    >
      <span
        aria-hidden
        className={`absolute top-1 bottom-1 w-[76px] rounded-full bg-[var(--cc-accent)] transition-transform duration-300 motion-reduce:transition-none ${season === "winter" ? "translate-x-[76px]" : "translate-x-0"}`}
      />
      {(["summer", "winter"] as Season[]).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          aria-pressed={season === s}
          className={`relative z-10 w-[76px] py-1.5 text-center font-[family-name:var(--cc-font-mono)] text-xs uppercase tracking-wide transition-colors duration-300 ${season === s ? "text-[var(--cc-accent-ink)]" : "text-[var(--cc-ink-soft)]"}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
