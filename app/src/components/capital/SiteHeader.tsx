import { Link } from "@tanstack/react-router";

import type { Season } from "../../lib/capital/data";
import { SeasonToggle } from "./SeasonToggle";

/**
 * Shared chrome: wordmark chip, quiet route links, season switch. `overlay`
 * floats it over the map stage (app page); otherwise it sits in the flow.
 */
export function SiteHeader({
  season,
  onSeason,
  current,
  overlay = false,
}: {
  season: Season;
  onSeason: (s: Season) => void;
  current: "app" | "partners" | "about";
  overlay?: boolean;
}) {
  const links = [
    { to: "/", label: "Request", key: "app" },
    { to: "/about", label: "About", key: "about" },
    { to: "/partners", label: "Partners", key: "partners" },
  ] as const;

  return (
    <header
      className={`${overlay ? "pointer-events-none absolute inset-x-0 top-0 z-10" : "relative"} flex items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5`}
    >
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-[var(--cc-paper)]/90 py-1.5 pl-2 pr-4 shadow-sm backdrop-blur-sm">
        <img
          src="/assets/logo.webp"
          alt=""
          aria-hidden
          className="h-7 w-7 object-contain mix-blend-multiply"
          draggable={false}
        />
        <Link to="/" className="text-lg font-semibold tracking-tight">
          CapitalClear
        </Link>
        <nav className="ml-2 hidden items-center gap-3 border-l border-[var(--cc-line)] pl-3 sm:flex">
          {links.map((l) => (
            <Link
              key={l.key}
              to={l.to}
              className={`font-[family-name:var(--cc-font-mono)] text-xs transition-colors ${current === l.key ? "text-[var(--cc-accent)]" : "text-[var(--cc-ink-soft)] hover:text-[var(--cc-ink)]"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="pointer-events-auto">
        <SeasonToggle season={season} onChange={onSeason} />
      </div>
    </header>
  );
}
