# CapitalClear

An Uber-style marketplace demo for on-demand snow clearing. Drop a pin, pick a service, and a trusted local crew comes out. Homeowners get a flat estimate and live tracking; partner companies keep 90 percent of every job, and CapitalClear runs on the remaining 10 percent. No lead fees, no subscriptions.

**Live demo: https://capitalclear.higgsfield.app**

This is a product demo with sample providers and simulated dispatch. There are no real accounts or payments.

## The three pages

| Route | What it shows |
|---|---|
| [`/`](https://capitalclear.higgsfield.app) | The customer app: tap your driveway on the map, pick driveway clearing, snow blowing, or walkway and salt, get auto-matched with a crew, and watch the plow truck drive in with a live status timeline. |
| [`/about`](https://capitalclear.higgsfield.app/about) | The marketing landing: "Snowed in? Handled." with the how-it-works and the 90/10 partner pitch. |
| [`/partners`](https://capitalclear.higgsfield.app/partners) | The partner dashboard: incoming nearby requests (accept or decline), today's route, and weekly earnings with the 90/10 split. |

The product is currently pinned winter-only. A full summer mode (lawn mowing, hedge trimming, edging) exists in the codebase unused, ready to be re-enabled for year-round positioning.

## Repo structure

- `app/` - the site: React 19 + TanStack Start, server-rendered, deployed as a single Cloudflare Worker. All product code lives in `app/src/` (routes, components under `components/capital/`, demo data under `lib/capital/`).
- `app/design-brief.md` - the design contract the build follows (palette, type, screen plans, round-by-round addenda).
- `refs/` - AI-generated design reference boards the screens were built against.
- `app/packages/` - vendored Higgsfield platform template packages. Unused by this site; do not edit.

All imagery (map plates, crew photos, icons, logo, covers) was generated with Higgsfield as part of the build.

## Local development

```bash
cd app
bun install
bun run dev        # http://localhost:5173
bun run typecheck
```

## Deploys

Deploys do not run through GitHub. The site builds and ships from the Higgsfield platform's git remote (`origin`) via its deploy pipeline; this GitHub repo is a mirror for sharing and review. If you change code here, it needs to be pushed to the Higgsfield remote and redeployed from there to reach the live site.
