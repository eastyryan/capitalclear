import type { Provider, Season, Service } from "../../lib/capital/data";
import { TRACK_STAGES } from "../../lib/capital/data";
import { CCIcon } from "./glyphs";

const STAGE_ICONS: Record<Season, string[]> = {
  summer: ["pin", "pin", "mower", "sprinkler"],
  winter: ["pin", "pin", "shovel", "snowflake"],
};

/**
 * Live tracking (board 4): the mono status timeline + dispatch facts block
 * beside the plate while the crew marker drives in.
 */
export function TrackingPanel({
  season,
  provider,
  service,
  stageIdx,
  etaMin,
}: {
  season: Season;
  provider: Provider;
  service: Service;
  stageIdx: number;
  etaMin: number;
}) {
  const headline =
    stageIdx === 0
      ? `${provider.name} is on the way`
      : stageIdx < 3
        ? `${provider.name} is here`
        : "All done";

  const facts: [string, string][] = [
    ["Service", service.name],
    ["ETA", stageIdx === 0 ? `${etaMin} min` : "on site"],
    ["Crew", `${provider.name.split(" ")[0]} team`],
    ["Vehicle", season === "winter" ? "Plow truck 42" : "Crew truck 17"],
    ["Weather", season === "winter" ? "Light snow, 28F" : "Sunny, 78F"],
  ];

  return (
    <aside className="pointer-events-auto absolute inset-x-4 bottom-4 rounded-xl bg-[var(--cc-paper)] p-5 shadow-xl sm:inset-x-auto sm:right-8 sm:top-24 sm:bottom-auto sm:w-80 sm:p-6">
      <h2 className="text-2xl font-semibold tracking-tighter">{headline}</h2>

      <ol className="mt-5 space-y-0">
        {TRACK_STAGES.map((stage, i) => {
          const state = i < stageIdx ? "past" : i === stageIdx ? "active" : "next";
          return (
            <li key={stage.id} className="relative flex gap-3 pb-5 last:pb-0">
              {i < TRACK_STAGES.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute left-[5px] top-4 h-full w-px ${state === "past" ? "bg-[var(--cc-accent)]" : "bg-[var(--cc-line)]"}`}
                />
              )}
              <span
                aria-hidden
                className={`relative mt-1 block h-[11px] w-[11px] rounded-full border-2 transition-colors duration-300 ${state === "next" ? "border-[var(--cc-line)] bg-[var(--cc-paper)]" : "border-[var(--cc-accent)] bg-[var(--cc-accent)]"}`}
              />
              <CCIcon name={STAGE_ICONS[season][i]} className="h-6 w-6 shrink-0" />
              <div className="flex-1">
                <p
                  className={`font-[family-name:var(--cc-font-mono)] text-sm ${state === "active" ? "font-medium text-[var(--cc-accent)]" : state === "past" ? "" : "text-[var(--cc-ink-soft)]"}`}
                >
                  {stage.label[season]}
                  {stage.id === "enroute" && state === "active" && ` ${etaMin} min`}
                </p>
                {state === "active" && i < 3 && (
                  <span className="mt-1.5 block h-0.5 w-full overflow-hidden rounded bg-[var(--cc-tint)]">
                    <span className="cc-progress block h-full w-full origin-left bg-[var(--cc-accent)]" />
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <dl className="mt-5 space-y-1.5 border-t border-[var(--cc-line)] pt-4">
        {facts.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="font-[family-name:var(--cc-font-mono)] text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
              {k}
            </dt>
            <dd className="font-[family-name:var(--cc-font-mono)] text-xs">{v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
