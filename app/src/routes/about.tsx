import { createFileRoute, Link } from "@tanstack/react-router";

import { useSeason } from "../lib/capital/useSeason";
import { CCIcon } from "../components/capital/glyphs";
import { SiteHeader } from "../components/capital/SiteHeader";

const SITE_ORIGIN = "https://capitalclear.higgsfield.app";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "CapitalClear: your yard, handled all year" },
      {
        name: "description",
        content:
          "On-demand lawn care in summer and driveway clearing in winter. Drop your location and a trusted local crew comes to you.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/about` }],
  }),
  component: About,
});

function About() {
  const [season, setSeason] = useSeason();

  const steps =
    season === "summer"
      ? ([
          { icon: "pin", title: "Drop your pin", copy: "Type your address or tap your yard on the map." },
          { icon: "mower", title: "A crew comes out", copy: "Vetted local companies pick up the job nearby." },
          { icon: "sprinkler", title: "Done, and paid fairly", copy: "You get a flat estimate. The crew keeps 90 percent." },
        ] as const)
      : ([
          { icon: "pin", title: "Drop your pin", copy: "Type your address or tap your driveway on the map." },
          { icon: "shovel", title: "A crew comes out", copy: "Vetted local companies pick up the job nearby." },
          { icon: "salt", title: "Done, and paid fairly", copy: "You get a flat estimate. The crew keeps 90 percent." },
        ] as const);

  return (
    <main className="min-h-dvh">
      <SiteHeader season={season} onSeason={setSeason} current="about" />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src="/assets/hero-split.webp"
            alt="One house in two seasons: mowed summer lawn on the left, cleared winter driveway on the right"
            className="aspect-[16/10] w-full object-cover sm:aspect-[16/7]"
            draggable={false}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 pb-6 pt-20 sm:px-10 sm:pb-10">
            <h1 className="text-4xl font-semibold tracking-tighter text-white sm:text-6xl">
              Your yard, handled.
              <span className="block">All year.</span>
            </h1>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 sm:mt-8">
          <p className="max-w-[44ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
            Mowing and lawn care all summer. Driveway and snow clearing all winter. One app, the
            same trusted local crews.
          </p>
          <div className="flex items-center gap-8">
            {/* Rationed garment: the drawing underline, used once on this page */}
            <Link to="/" className="group relative text-xl font-semibold tracking-tight">
              Request service
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-100 bg-[var(--cc-accent)] transition-transform duration-300 group-hover:scale-x-0 group-hover:[transition-delay:0ms] motion-reduce:transition-none"
              />
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-0.5 w-full origin-right scale-x-0 bg-[var(--cc-ink)] transition-transform delay-150 duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
              />
            </Link>
            {/* Corner-bracket viewfinder target */}
            <Link
              to="/partners"
              className="group relative px-4 py-2 text-base font-medium text-[var(--cc-ink)]"
            >
              <span aria-hidden className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[var(--cc-accent)] transition-all duration-200 group-hover:h-full group-hover:w-2.5 motion-reduce:transition-none" />
              <span aria-hidden className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[var(--cc-accent)] transition-all duration-200 group-hover:h-full group-hover:w-2.5 motion-reduce:transition-none" />
              Become a partner
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-24 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-tighter sm:text-3xl">How it works</h2>
        <ol className="mt-6 grid gap-8 border-t border-[var(--cc-line)] pt-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 sm:block">
              <CCIcon name={s.icon} className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
              <div>
                <p className="mt-0 font-medium tracking-tight sm:mt-4">
                  <span className="mr-2 font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
                    {i + 1}
                  </span>
                  {s.title}
                </p>
                <p className="mt-1 max-w-[36ch] text-sm leading-relaxed text-[var(--cc-ink-soft)]">
                  {s.copy}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Partner band */}
      <section className="mt-16 bg-[var(--cc-deep)] py-14 text-white transition-colors duration-500 motion-reduce:transition-none sm:mt-24 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-12 gap-y-8 px-4 sm:px-8">
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl">
              Partners keep 90 percent.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              CapitalClear fills your route with nearby jobs in every season and takes 10 percent
              only when a job completes. No lead fees, no subscriptions.
            </p>
            <Link
              to="/partners"
              className="group mt-6 inline-flex items-center gap-2 text-base font-medium text-white"
            >
              See the partner dashboard
              <svg
                viewBox="0 0 20 16"
                className="h-4 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M2 8h15M12 3l5 5-5 5" />
              </svg>
            </Link>
          </div>
          <p className="font-[family-name:var(--cc-font-mono)] text-7xl tracking-tighter text-white/90 sm:text-8xl">
            90/10
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-8">
        <div className="flex items-center gap-2">
          <img
            src="/assets/logo.webp"
            alt=""
            aria-hidden
            className="h-6 w-6 object-contain mix-blend-multiply"
            draggable={false}
          />
          <span className="font-semibold tracking-tight">CapitalClear</span>
        </div>
        <nav className="flex gap-5 font-[family-name:var(--cc-font-mono)] text-xs text-[var(--cc-ink-soft)]">
          <Link to="/" className="hover:text-[var(--cc-ink)]">
            Request
          </Link>
          <Link to="/partners" className="hover:text-[var(--cc-ink)]">
            Partners
          </Link>
        </nav>
        <p className="font-[family-name:var(--cc-font-mono)] text-[11px] text-[var(--cc-ink-soft)]">
          Demo with sample providers
        </p>
      </footer>
    </main>
  );
}
