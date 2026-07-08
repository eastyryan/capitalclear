import { useState } from "react";

import type { Scope, Season, Service } from "../../lib/capital/data";
import { SCOPES, SEASON_COPY, SERVICES, estimate } from "../../lib/capital/data";
import { ArrowRight, CCIcon, Chevron } from "./glyphs";

/**
 * Service picker (board 2): accordion rows over the dimmed plate, scope
 * chips, and the meter-bar CTA fused to the live estimate.
 */
export function ServicesSheet({
  season,
  serviceId,
  scope,
  onSelect,
  onScope,
  onRequest,
  onBack,
}: {
  season: Season;
  serviceId: string | null;
  scope: Scope;
  onSelect: (id: string) => void;
  onScope: (s: Scope) => void;
  onRequest: () => void;
  onBack: () => void;
}) {
  const services = SERVICES[season];
  const copy = SEASON_COPY[season];
  const selected = services.find((s) => s.id === serviceId) ?? services[0];
  const price = estimate(selected, scope);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl rounded-t-xl bg-[var(--cc-paper)] px-5 pb-5 pt-4 shadow-2xl sm:px-8 sm:pb-8 sm:pt-6">
      <div className="flex items-center justify-between">
        <p className="font-[family-name:var(--cc-font-mono)] text-[11px] uppercase tracking-widest text-[var(--cc-ink-soft)]">
          {copy.services}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[var(--cc-ink-soft)] underline underline-offset-4 hover:text-[var(--cc-ink)]"
        >
          Change location
        </button>
      </div>

      <ul className="mt-4 divide-y divide-[var(--cc-line)]">
        {services.map((s: Service) => {
          const active = s.id === selected.id;
          const open = expanded === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(s.id);
                  setExpanded(open ? null : s.id);
                }}
                aria-expanded={open}
                className={`flex w-full items-center gap-4 py-3.5 text-left transition-colors ${active ? "" : "opacity-75 hover:opacity-100"}`}
              >
                <CCIcon name={s.icon} className="h-10 w-10 shrink-0" />
                <span className="flex-1 text-lg font-medium tracking-tight">{s.name}</span>
                <span className="font-[family-name:var(--cc-font-mono)] text-base">
                  ${estimate(s, scope)}
                </span>
                <Chevron
                  className={`h-4 w-4 text-[var(--cc-ink-soft)] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <p className="overflow-hidden pl-14 text-sm leading-relaxed text-[var(--cc-ink-soft)]">
                  <span className="block pb-3">{s.blurb}</span>
                </p>
              </div>
            </li>
          );
        })}
        <li className="flex items-center gap-4 py-3.5 opacity-40" aria-disabled>
          <CCIcon name={season === "summer" ? "snowflake" : "mower"} className="h-10 w-10 shrink-0" />
          <span className="flex-1 text-lg tracking-tight">{copy.offSeason}</span>
          <span className="font-[family-name:var(--cc-font-mono)] text-xs">
            {season === "summer" ? "back in Dec" : "back in Apr"}
          </span>
        </li>
      </ul>

      <div className="mt-4 flex items-center gap-2">
        <span className="mr-1 font-[family-name:var(--cc-font-mono)] text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
          {season === "summer" ? "Yard size" : "Driveway size"}
        </span>
        {SCOPES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onScope(s.id)}
            aria-pressed={scope === s.id}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150 motion-reduce:transition-none ${scope === s.id ? "border-[var(--cc-accent)] bg-[var(--cc-accent)] text-[var(--cc-accent-ink)]" : "border-[var(--cc-line)] text-[var(--cc-ink-soft)] hover:text-[var(--cc-ink)]"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Meter bar: the estimate IS the button */}
      <button
        type="button"
        onClick={onRequest}
        className="group mt-5 flex w-full items-center justify-between rounded-lg bg-[var(--cc-accent)] px-5 py-4 text-[var(--cc-accent-ink)] transition-[filter] duration-150 hover:brightness-110 active:scale-[0.99] motion-reduce:transition-none"
      >
        <span className="font-[family-name:var(--cc-font-mono)] text-lg">
          ${price} <span className="text-sm opacity-80">estimate</span>
        </span>
        <span className="flex items-center gap-2 text-lg font-medium">
          Request service
          <ArrowRight className="h-4 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </button>
    </div>
  );
}
