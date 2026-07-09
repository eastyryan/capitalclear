import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import type { JobRequest, RouteJob } from "../lib/capital/partnerData";
import { EARNINGS, INCOMING, TODAYS_ROUTE } from "../lib/capital/partnerData";
import { SiteHeader } from "../components/capital/SiteHeader";

const SITE_ORIGIN = "https://capitalclear.higgsfield.app";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "CapitalClear for partners" },
      {
        name: "description",
        content:
          "See how partner companies receive nearby jobs, run their route, and keep 85 percent of every dollar on CapitalClear.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/partners` }],
  }),
  component: Partners,
});

function Partners() {
  const [queue, setQueue] = useState<JobRequest[]>(INCOMING.winter);
  const [route, setRoute] = useState<RouteJob[]>(TODAYS_ROUTE.winter);
  const earnings = EARNINGS.winter;
  const maxDay = Math.max(...earnings.days.map((d) => d.amount));

  const accept = (job: JobRequest) => {
    setQueue((q) => q.filter((j) => j.id !== job.id));
    setRoute((r) => [
      ...r,
      {
        id: job.id,
        address: job.address,
        service: job.service,
        time: "next up",
        status: "scheduled",
        price: job.price,
      },
    ]);
  };

  const decline = (job: JobRequest) => {
    setQueue((q) => q.filter((j) => j.id !== job.id));
  };

  return (
    <main className="min-h-dvh">
      <SiteHeader current="partners" />

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-8">
        <h1 className="mt-4 text-4xl font-semibold tracking-tighter sm:text-5xl">
          Your plow route, dispatched.
        </h1>
        <p className="mt-2 max-w-[52ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
          This is the partner side of the demo: when the snow falls, nearby requests come to you,
          your route fills itself, and you keep 85 percent of every dollar.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            {/* Incoming requests */}
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Incoming requests</h2>
              <span className="font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
                {queue.length} nearby
              </span>
            </div>
            {queue.length === 0 ? (
              <p className="mt-4 border-t border-[var(--cc-line)] pt-6 text-sm text-[var(--cc-ink-soft)]">
                Queue is clear. New requests appear here as neighbors book.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
                {queue.map((job) => (
                  <li key={job.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium tracking-tight">{job.address}</p>
                      <p className="mt-0.5 font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
                        {job.service} · {job.scope} · {job.distanceMi.toFixed(1)} mi
                      </p>
                    </div>
                    <span className="font-[family-name:var(--cc-font-mono)] text-base">
                      ${job.price}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => accept(job)}
                        className="rounded-lg bg-[var(--cc-accent)] px-3.5 py-1.5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => decline(job)}
                        className="text-sm text-[var(--cc-ink-soft)] hover:text-[var(--cc-ink)]"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Today's route */}
            <h2 className="mt-12 text-xl font-semibold tracking-tight">Today's route</h2>
            <ul className="mt-3 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
              {route.map((job) => (
                <li key={job.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4">
                  <span className="w-20 font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
                    {job.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium tracking-tight">{job.address}</p>
                    <p className="mt-0.5 font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
                      {job.service}
                    </p>
                  </div>
                  <span className="font-[family-name:var(--cc-font-mono)] text-sm">
                    ${job.price}
                  </span>
                  <span
                    className={`font-[family-name:var(--cc-font-mono)] text-xs ${job.status === "done" ? "text-[var(--cc-ink-soft)] line-through" : job.status === "in progress" ? "text-[var(--cc-accent)]" : ""}`}
                  >
                    {job.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Earnings */}
          <aside className="h-fit rounded-xl bg-[var(--cc-tint)] p-6">
            <p className="font-[family-name:var(--cc-font-mono)] text-xs uppercase tracking-wide text-[var(--cc-ink-soft)]">
              This week
            </p>
            <p className="mt-1 font-[family-name:var(--cc-font-mono)] text-5xl tracking-tighter">
              ${earnings.week.toLocaleString()}
            </p>

            <div className="mt-5">
              <div className="flex h-2 overflow-hidden rounded-full">
                <span className="w-[85%] bg-[var(--cc-accent)]" />
                <span className="w-[15%] bg-[var(--cc-ink)]/25" />
              </div>
              <p className="mt-2 text-sm text-[var(--cc-ink-soft)]">
                You keep 85 percent:{" "}
                <span className="font-[family-name:var(--cc-font-mono)] text-[var(--cc-ink)]">
                  ${earnings.afterFee.toLocaleString()}
                </span>{" "}
                paid out Friday.
              </p>
            </div>

            <div className="mt-6 flex items-end gap-2" aria-hidden>
              {earnings.days.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
                  <span
                    className="w-full rounded-sm bg-[var(--cc-accent)]/55"
                    style={{ height: `${Math.round((d.amount / maxDay) * 64) + 8}px` }}
                  />
                  <span className="font-[family-name:var(--cc-font-mono)] text-[10px] text-[var(--cc-ink-soft)]">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 border-t border-[var(--cc-line)] pt-4 text-xs leading-relaxed text-[var(--cc-ink-soft)]">
              No lead fees, no subscriptions. CapitalClear takes 15 percent of completed jobs,
              nothing else.
            </p>
          </aside>
        </div>

        <p className="mt-14 font-[family-name:var(--cc-font-mono)] text-[11px] text-[var(--cc-ink-soft)]">
          Demo with sample jobs and earnings.{" "}
          <Link to="/" className="underline underline-offset-4 hover:text-[var(--cc-ink)]">
            See the customer side
          </Link>
        </p>
      </div>
    </main>
  );
}
