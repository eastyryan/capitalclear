// Legal copy for the Terms and Privacy pages, plus the liability waiver shown
// at booking confirmation.
//
// Ported from the Next.js repo's src/messages/en.json (Terms / Privacy /
// Booking namespaces). Two clauses were ADAPTED rather than copied verbatim,
// because the original described behaviour this app does not have — legal copy
// that misdescribes the real flow is worse than none:
//
//   - "seasonal surcharge from December through March" -> flat pricing. This
//     app quotes one flat rate with no surge (see quoteFor in ./data).
//   - "payment is captured after the Pro uploads photo proof" -> payment is
//     taken at booking through Stripe Checkout (see ./stripe), and there is no
//     photo-proof step here yet.
//
// Revisit both if winter surge pricing or photo proof gets ported over.

export interface LegalSection {
  heading: string
  body: string[]
}

export interface LegalDoc {
  eyebrow: string
  title: string
  effective: string
  intro: string
  sections: LegalSection[]
}

export const SUPPORT_EMAIL = "hello@capitalclear.ca"
export const PRIVACY_EMAIL = "privacy@capitalclear.ca"

export const TERMS: LegalDoc = {
  eyebrow: "Legal",
  title: "Terms of Service",
  effective: "Effective July 28, 2026",
  intro:
    "These terms govern your use of CapitalClear. By booking or providing services through the platform, you agree to them.",
  sections: [
    {
      heading: "Overview",
      body: [
        "CapitalClear is an online marketplace that connects homeowners (“Clients”) in the National Capital Region with independent contractors (“Pros”) for residential snow removal.",
        "CapitalClear facilitates bookings and payments but is not the provider of the services and does not employ the Pros.",
      ],
    },
    {
      heading: "Accounts",
      body: [
        "You must provide accurate information when creating an account and keep your credentials secure.",
        "You are responsible for all activity that occurs under your account.",
      ],
    },
    {
      heading: "Bookings and payment",
      body: [
        "Prices are shown in full before you confirm. CapitalClear charges one flat rate per visit based on your driveway size, plus any add-ons you select — there is no storm surge and no seasonal surcharge.",
        "Ontario HST is added to the pre-tax subtotal at checkout. Payment is taken when you confirm your booking; your receipt shows the subtotal, HST and total charged.",
      ],
    },
    {
      heading: "Pros",
      body: [
        "Pros are independent contractors, not employees of CapitalClear. Pros set their own availability and are responsible for completing accepted jobs to a reasonable standard.",
        "CapitalClear retains a platform fee of 15 percent from each completed job; the remaining 85 percent is paid out to the Pro. There are no lead fees and no subscriptions.",
      ],
    },
    {
      heading: "Cancellations and refunds",
      body: [
        "You may cancel a booking at no charge any time before a crew has been dispatched to your address, and we refund the full amount to your original payment method.",
        "Once a crew has been dispatched, the visit is charged in full — the Pro has already committed the truck and the route.",
        "If a crew does not arrive, or the work is not completed to a reasonable standard, contact us within 48 hours and we will refund the visit. Repeated late cancellations may result in account restrictions.",
      ],
    },
    {
      heading: "Liability",
      body: [
        "CapitalClear provides the platform “as is” and is a marketplace only — it does not perform snow removal and does not employ the Pros.",
        "CapitalClear is not liable or responsible for any slip-and-fall or other personal injury, or for any damage to a Client's house, driveway, property, or belongings, arising from services booked through the platform.",
        "The independent Pro (subcontractor) who performs the work carries sole responsibility and liability for the service and for any injury or damage resulting from it. Clients accept this waiver when confirming a booking.",
        "To the maximum extent permitted by law, CapitalClear's liability is limited to the amount paid for the affected booking.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.",
      ],
    },
    {
      heading: "Contact",
      body: [`Questions about these terms can be sent to ${SUPPORT_EMAIL}.`],
    },
  ],
}

export const PRIVACY: LegalDoc = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  effective: "Effective July 28, 2026",
  intro:
    "This policy explains what information CapitalClear collects, how we use it, and the choices you have.",
  sections: [
    {
      heading: "Information we collect",
      body: [
        "Account information such as your name, email and address.",
        "Booking details including service type, postal code, schedule and property notes.",
        "Payment information, processed securely by our payment provider.",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "To create and manage your account, process bookings, and connect Clients with Pros.",
        "To send service updates and receipts.",
        "To improve the platform and keep it secure.",
      ],
    },
    {
      heading: "Sharing",
      body: [
        "We share booking details with the Pro assigned to your job so they can complete it. We do not sell your personal information.",
      ],
    },
    {
      heading: "Payments",
      body: [
        "Payment details are handled by our payment provider. CapitalClear does not store full card numbers.",
      ],
    },
    {
      heading: "Data retention",
      body: [
        "We retain your information for as long as your account is active or as needed to provide the service and meet legal obligations.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You may request access to, correction of, or deletion of your personal information by contacting us.",
      ],
    },
    {
      heading: "Contact",
      body: [`Privacy questions can be sent to ${PRIVACY_EMAIL}.`],
    },
  ],
}

/** Shown at booking confirmation; the Client must accept it to continue. */
export const LIABILITY_WAIVER = {
  title: "Liability & terms",
  body: "CapitalClear is a marketplace that connects you with independent snow-removal subcontractors. CapitalClear is not liable or responsible for any slip-and-fall injuries, or for any damage to your house, property, or belongings. The subcontractor who performs the work carries sole responsibility and liability for the service and any resulting injury or damage.",
  agree: "I have read and agree to the Terms of Service and this liability waiver.",
  required: "Please accept the liability waiver to confirm your booking.",
}
