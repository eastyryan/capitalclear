import { SEASON_COPY, TRACK_STAGES, type Provider, type Service } from "../../lib/data"
import { useSeason } from "../../lib/season"
import Icon from "../Icon"

export default function TrackingPanel({
  provider,
  service,
  etaMin,
  stageIdx,
}: {
  provider: Provider
  service: Service
  etaMin: number
  stageIdx: number
}) {
  const { season } = useSeason()
  const copy = SEASON_COPY[season]
  const headline =
    stageIdx === 0
      ? `${provider.name} is on the way`
      : stageIdx < 3
        ? `${provider.name} is here`
        : "All done"

  return (
    <aside
      className="cc-sheet-in absolute inset-x-0 bottom-0 z-20 max-h-[60dvh] overflow-y-auto rounded-t-3xl bg-paper/95 p-6 ring-1 ring-line backdrop-blur-md sm:inset-x-auto sm:top-24 sm:right-6 sm:bottom-auto sm:w-[340px] sm:rounded-3xl sm:p-7 lg:right-12"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-extrabold tracking-tight">{headline}</h2>

      <ol className="mt-6 space-y-0">
        {TRACK_STAGES.map((s, i) => {
          const active = i === stageIdx
          const done = i < stageIdx
          return (
            <li key={s.id} className="relative flex gap-3.5 pb-5 last:pb-0">
              {i < TRACK_STAGES.length - 1 && (
                <span
                  className={`absolute top-6 left-[9px] h-[calc(100%-20px)] w-px ${
                    done ? "bg-accent" : "bg-line"
                  }`}
                />
              )}
              <span
                className={`relative z-10 mt-1 h-[19px] w-[19px] rounded-full border-2 transition-colors duration-300 ${
                  done || active ? "border-accent bg-accent" : "border-line bg-paper"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon id={s.icon[season]} size={24} />
                  <span
                    className={`font-mono text-sm ${
                      active ? "font-semibold text-ink" : done ? "text-ink-soft line-through" : "text-ink-soft"
                    }`}
                  >
                    {s.label[season]}
                    {active && s.id === "enroute" && etaMin > 0 ? ` ${etaMin} min` : ""}
                  </span>
                </div>
                {active && i < 3 && (
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-tint">
                    <div className="cc-progress h-full w-full rounded-full bg-accent" />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-5 text-sm">
        <div>
          <dt className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
            Service
          </dt>
          <dd className="mt-0.5 font-semibold">{service.name}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
            ETA
          </dt>
          <dd className="mt-0.5 font-mono">{etaMin > 0 ? `${etaMin} min` : "on site"}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
            Crew
          </dt>
          <dd className="mt-0.5 font-semibold">{provider.name.split(" ")[0]} team</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
            Vehicle
          </dt>
          <dd className="mt-0.5 font-mono">{copy.vehicle}</dd>
        </div>
        <div className="col-span-2">
          <dt className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
            Weather
          </dt>
          <dd className="mt-0.5 font-mono">{copy.weather}</dd>
        </div>
      </dl>
    </aside>
  )
}
