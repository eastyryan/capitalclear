import { useSeason } from "../lib/season"
import Icon from "./Icon"

/** Season switch: the same platform, two grades. */
export default function SeasonToggle() {
  const { season, setSeason } = useSeason()
  return (
    <div
      className="flex items-center gap-0.5 rounded-full bg-tint/70 p-0.5"
      role="group"
      aria-label="Season"
    >
      <button
        aria-label="Winter mode"
        aria-pressed={season === "winter"}
        onClick={() => setSeason("winter")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          season === "winter" ? "bg-paper shadow ring-1 ring-accent" : "opacity-55 hover:opacity-90"
        }`}
      >
        <Icon id="snowflake" size={20} />
      </button>
      <button
        aria-label="Summer mode"
        aria-pressed={season === "summer"}
        onClick={() => setSeason("summer")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          season === "summer" ? "bg-paper shadow ring-1 ring-accent" : "opacity-55 hover:opacity-90"
        }`}
      >
        <Icon id="mower" size={20} />
      </button>
    </div>
  )
}
