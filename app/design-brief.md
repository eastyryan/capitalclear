# CapitalClear design brief

## Design read
For homeowners who want their yard handled the way Uber handles a ride: one screen, drop a pin, someone comes. Emotional register: calm competence, neighborly trust, zero gig-app clutter.

## Concept spine
**"The same driveway, two seasons."** The whole app is one living neighborhood scene that exists in two graded states, summer and winter. A season switch crossfades the entire product (map plate, palette, services, copy) between the two grades. The spine is the business model made visible: one platform, the same trusted crews, year-round.
(Spine family: living system.)

## Delivery tier
`editorial` — this is a product UI, not a marketing page. Typography, bespoke chrome, generated imagery, micro-motion only. The signature mechanic carries the wow; no scroll-jacking.

## Tier-1 technique
**B2, grade-shift interaction pair.** Two renders of the SAME aerial neighborhood composition (summer grade: fresh greens, warm light; winter grade: snow cover, ice-blue light) crossfaded by the season switch, with a subtle cursor-parallax drift on the plate. Chosen because B2 literally enacts the spine: the site notices the season the way the business does. Mobile degradation: crossfade on toggle only, no cursor drift. Reduced motion: instant swap, no fade.

## Locked palette (two graded modes, one accent each)
Theme paradigm: **Pristine Light** in both modes; the grade shifts, the structure never does.
- **Summer mode:** paper `#F7F6F2`, ink `#1C2420`, accent grass `#2F7A3D` (single accent), support moss tint `#E8EFE6`.
- **Winter mode:** snow paper `#F4F7FA`, ink `#18202A`, accent ultramarine-ice `#2B5FB8` (single accent), support frost tint `#E4ECF5`.
Defense: light ground keeps a utility app legible outdoors on a phone; the paired greens/blues come straight from the material world (turf, ice) and dodge every banned family (no dark+neon, no beige+brass, no purple, no graphite+ember).

## Locked type
**Outfit** (display + UI) + **IBM Plex Mono** (prices, ETAs, job numbers, plate labels). Friendly geometric sans reads as a consumer utility, not a luxury brochure; mono carries the dispatch/meter register. No serif anywhere.

## Combinatorial pick (held across all boards)
- Theme paradigm: Pristine Light (dual-graded)
- Background character: full-bleed cinematic imagery (the aerial plate IS the ground)
- Typography character: clean grotesk + mono meter
- Hero architecture: massive image-first with restrained text (map-as-canvas)
- Section system: asymmetric premium flow (floating panels over the plate)
- Signature components: product UI panel stack · oversized metrics strip (price/ETA meter) · hover-accordion slices (service list) · layered image crop frames (provider cards)
- Narrative spine: living system (the neighborhood)
- Second-read moment: one oversized numeral, the estimate price, set as structure on the receipt screen (placed once)

## Screen plan (one board each, distinct composition anchors)
1. **Request** — full-bleed aerial plate, floating location panel. Anchor: image-as-canvas, panel bottom-left. CTA: set-location.
2. **Services** — bottom-sheet slices over the dimmed plate, seasonal services first, off-season collapsed. Anchor: bottom-of-frame sheet. Includes lawn/driveway size scope chips and the live estimate meter (mono).
3. **Match** — provider cards on an off-grid horizontal rail, plate parallaxed behind. Anchor: off-grid offset. Each card: monogram, rating, jobs, ETA, price.
4. **Tracking** — asymmetric split: plate with moving crew marker left, mono status timeline right (en route, arrived, in progress, done). Anchor: asymmetric split.
5. **Receipt** — quiet centered card, the oversized price numeral as structure, one line: "Your provider keeps 90%. CapitalClear runs on 10%." Anchor: stacked center.

Eyebrow budget: max 2 across 5 screens; plan uses 1 (Services sheet label).

## Asset plan
- Aerial neighborhood plate, one composition, **two grades** (summer, winter) — hero/map surface + the B2 pair.
- Crew truck marker sprite (top-down, both grades).
- Custom icon set, one stroke style, brand palette: pin, mower, hedge, sprinkler, snowflake, shovel, salt, clock, star, receipt.
- 5 invented local-company monograms (provider cards).
- CapitalClear logo/monogram + favicon.
- State artwork: searching-for-provider (radar sweep over plate crop), job-done (tidy lawn / cleared driveway vignette).
- OG card + 3:2 launch cover (per app-cover.md).

## CTA inventory (bespoke chrome, no shared button class)
1. **Set location** — framed block on the location panel, hairline border, fills accent on press (`scale-[0.98]`).
2. **Request service** — full-width meter bar fused to the live estimate: price left (mono), label right; the whole bar is the button.
3. **Choose provider** — underlined inline link + arrow inside each provider card, underline thickens on hover.
4. **New request** — quiet text button on the receipt, ink color, accent on hover.
One label per intent page-wide. No pills.

## Copy register
Plain, functional, neighborly. Headlines ≤8 words ("Your yard, handled."). Mono for every number. No em or en dashes anywhere. Sample providers labeled as demo data in the footer line only.

## Data honesty
Demo build: deterministic sample providers, simulated dispatch and tracking on a timer, no accounts, no payments. Estimates labeled "estimate". No invented marketing stats.

## Round 2 addendum (2026-07-08): partner dashboard + landing page

New screens, same locked palette, type, and corner language. Added token:
deep band ground `--cc-deep` (bottle green #1E4A28 summer, deep marine
#1B3B66 winter) for the landing's partner band.

6. **Partners dashboard (`/partners`)** - working demo for pitching companies.
   Asymmetric two-column: left, "Incoming requests" rows (address, service,
   distance, mono price, Accept/Decline) over "Today's route" with status
   chips; right, earnings panel with a huge mono weekly total, a thin 90/10
   split bar, and five muted weekly bars. Hairline dividers, no heavy cards.
   Anchor: asymmetric split, content-left.
7. **Landing (`/about`)** - editorial. Hero: split-season house photo
   (text-free generated asset), headline "Your yard, handled. All year.",
   two CTAs. How-it-works: 3 steps in a hairline row using the generated icon
   sprite. Partner band: full-width deep ground, oversized mono "90/10",
   line "Partners keep 90 percent." Footer: wordmark + route links + demo line.
   Anchors: image-first hero, hairline strip, color-blocked band.

CTA inventory additions (rationed garments audited per page):
- `/about` "Request service": oversized underlined text link, underline draws
  in (the page's single rationed garment).
- `/about` "Become a partner": corner-bracket viewfinder target, brackets
  close on hover.
- `/partners` "Accept": small solid accent chip that imprints on press.
  "Decline": quiet text link. Season toggle reused from the app chrome.

Eyebrow budget: `/about` 4 sections -> ceil(4/3)=2, used 0. `/partners` uses
mono column labels (exempt rail labels), 0 eyebrows.

## Round 3 addendum (2026-07-08): snow-only pivot + friendlier flow

Product pinned to the WINTER grade site-wide (season toggle removed from the
UI; summer tokens, data, and components stay in the repo unused for a later
un-pivot). Header carries a mono tagline chip: "snow clearing, on demand".

Customer flow collapsed to 4 steps for usability (mobile-first, all controls
44px+, sticky safe-area CTA):
1. **Request** (replaces Locate + Services): one sheet with a mono 1-2-3
   guide line, address input with inline pin feedback, the 3 snow services as
   large tap cards with live prices, driveway-size chips, and a sticky meter
   bar CTA "See my crew" (disabled with helper text until a location exists).
2. **Crew confirm** (replaces the compare rail): ~1s radar search, then the
   best crew pre-picked with one "Confirm crew" bar; "Choose a different
   crew" expands the two alternates inline.
3. **Tracking**: unchanged layout, snappier pacing (drive 4.5s, ~10s total).
4. **Receipt**: CTA "Book another clearing", microline "Snowed in again? It
   takes one tap."

Landing hero swaps to a text-free winter plow scene (`hero-winter.webp`),
headline "Snowed in? Handled." Partner page pinned to winter data, headline
"Your plow route, dispatched." Cover/OG regenerated winter-first.
