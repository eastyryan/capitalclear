# CapitalClear partner outreach playbook

Goal: convert Ottawa-area snow removal companies into founding partners.
The pitch surface already exists: https://capitalclear-redesign.netlify.app/partners
(live dashboard demo + application form). Applications land in Netlify Forms
and email you automatically.

## Positioning (say this, in this order)

1. **The hook:** "Every storm, we send you driveways near your route. You keep
   90 percent. No lead fees, no subscriptions."
2. **The enemy:** lead-gen sites that charge per lead whether or not it converts,
   and deadhead kilometers between scattered jobs. CapitalClear only takes its
   10 percent when a job completes, and jobs cluster by neighborhood.
3. **The proof:** the live demo. Send them straight to the partner dashboard so
   they see the incoming-requests queue, the route view, and the 90/10 split on
   a sample week. It sells better than any paragraph.
4. **The honesty:** this is a pre-launch product demo. You are recruiting
   founding partners for this winter, not claiming live volume. Never invent
   demand numbers. "We are building the homeowner waitlist now" is the true line.

## Who to contact first

Work `ottawa-leads.csv` top-down within score A, then B:

- **A** = residential focus, active website, reachable by email. Best fit:
  companies already doing per-visit or on-demand work.
- **B** = residential but seasonal-contract-only. Pitch angle shifts to
  "fill the gaps between your contract stops with paid one-off clearings."
- **C** = commercial-only, weak web presence, or bad fit. Call only if A and B
  run dry.

French-first companies (Gatineau side): send the FR variant or keep it short
and plain; do not send an English wall of text.

## CASL compliance (Canada, non-negotiable)

- **Consent basis:** these are businesses whose contact info is conspicuously
  published for business inquiries, and the message is relevant to their
  business. That is implied consent under CASL. Log `consent_basis =
  "published business contact"` in the CSV per lead, and the date.
- **Every message must include:** who you are (name + company), why you are
  writing, a working way to opt out, and a mailing contact.
- **Footer block (append to every email):**

  > Connor Shibley · CapitalClear · Ottawa, ON
  > You are receiving this because your business publicly lists this address
  > for inquiries. Reply "unsubscribe" and I will not contact you again.
  > [your mailing address or PO box]

- Honor opt-outs within 10 days (CASL requirement); mark `status = passed` and
  never re-contact.

## Email sequence

Send from a real personal address. One person, plain text, no images, no
tracking pixels. Batch of 10 per week so replies stay manageable.

### Email 1 (day 0) - the demo

> **Subject:** Your plow route, plus the driveways in between
>
> Hi [first name],
>
> I run CapitalClear, an Ottawa project that works like Uber for snow
> clearing: a homeowner drops a pin, the request goes to a nearby plow
> company, and the crew keeps 90 percent of the price. No lead fees, no
> subscriptions. We take 10 percent only when a job completes.
>
> I saw [company] serves [area] - [one personalizing detail from the notes
> column]. You are exactly the kind of operator we want as a founding
> partner this winter.
>
> Two minutes of your time: here is the partner dashboard working with
> sample data - capitalclear-redesign.netlify.app/partners
>
> If it looks useful, apply at the bottom of that page or just reply here.
>
> Connor
> [CASL footer]

### Email 2 (day 4) - the math

> **Subject:** The 90/10 math on one storm
>
> Hi [first name],
>
> Quick follow-up with the numbers, because that is what matters.
>
> A medium driveway clearing books at about $70. You keep $63 of it. Ten
> driveways clustered in [their area] on one storm morning is $630 kept,
> with no marketing spend and no lead fees. Requests come to your phone,
> you accept the ones on your route.
>
> Demo again if you want to poke at it:
> capitalclear-redesign.netlify.app/partners
>
> Connor
> [CASL footer]

### Email 3 (day 11) - the close

> **Subject:** Founding partner spots for this winter
>
> Hi [first name],
>
> Last note from me. We are signing a small group of founding partners
> before the season and matching them to neighborhoods first. If [company]
> wants [their area], the application takes two minutes:
> capitalclear-redesign.netlify.app/partners#apply
>
> If it is not for you, no hard feelings - reply "unsubscribe" and I will
> leave you be.
>
> Connor
> [CASL footer]

### FR variant, Email 1 (Gatineau leads)

> **Objet:** Vos routes de déneigement, plus les entrées entre elles
>
> Bonjour [prénom],
>
> Je dirige CapitalClear, un projet d'Ottawa qui fonctionne comme Uber pour
> le déneigement: un résident place une demande, elle est envoyée à une
> entreprise proche, et l'équipe garde 90 pour cent du prix. Pas de frais
> par prospect, pas d'abonnement.
>
> La démo du tableau de bord partenaire (données fictives):
> capitalclear-redesign.netlify.app/partners
>
> Si ça vous intéresse, répondez ici ou remplissez le formulaire au bas de
> la page.
>
> Connor
> [bloc CASL]

## Phone script (A-leads with no email reply after Email 2)

Contractors answer phones. Call mid-morning, weekdays.

> "Hi, is this [first name]? I'll keep it to thirty seconds. I'm Connor,
> I'm building CapitalClear here in Ottawa - it's like Uber for driveway
> snow clearing. Homeowner drops a pin, the request goes to the nearest
> partner company, you keep 90 percent, no lead fees. I'm signing founding
> partners for this winter and [company]'s reviews in [area] stood out.
> Can I text you the link to the demo dashboard?"

- If yes: text the /partners link, mark `status = replied`, follow up in 2 days.
- Voicemail: same script minus the question, end with "No need to call back,
  I'll send the link by email."
- If "not interested": thank them, mark `passed`, never re-contact.

## Secondary channels

- Ottawa/Gatineau contractor and landscaping Facebook groups: post once,
  plainly ("building this, looking for founding plow partners, demo link"),
  no spamming.
- Kijiji Ottawa "snow removal" service posters: many are owner-operators
  with one truck - ideal early partners. Same email 1, shortened.
- r/ottawa cautiously: one honest show-and-tell post about the product,
  not repeated ads.

## Ops loop

1. Every send updates the CSV: `status` (new → contacted → replied → applied →
   passed), `last_touch` date, `consent_basis`.
2. Applications arrive via Netlify Forms (email notification already wired).
   Reply within 24h with a 15-minute call link.
3. Weekly: review reply rate per subject line, adjust; move 10 new leads into
   the sequence.
4. When a partner signs: mark `applied`, add them to the pilot neighborhood
   map, and update the waitlist copy ("crews live in Barrhaven" beats
   "crews coming soon").

## What NOT to do

- No invented stats, no "hundreds of homeowners waiting."
- No mass-blast tools; 10/week, personally sent.
- No follow-up after an unsubscribe or a "no."
- No LinkedIn scraping or personal (non-business) emails - published business
  contacts only.
