import 'server-only';
import type { PaymentProvider, PaymentResult } from './provider';

// Real Stripe Connect (destination charges) provider — STUB.
//
// This module is intentionally importable WITHOUT the Stripe SDK or any keys
// so that `getPaymentProvider()` can reference its type and the build never
// breaks in environments where Stripe isn't configured. Every method returns
// a not-configured error until PAYMENTS_MODE=stripe and real keys are wired in.
//
// Implementation sketch (when wired up with `import Stripe from 'stripe'`):
//
//   authorizeHold(jobId, amountCents):
//     Create a PaymentIntent with capture_method: 'manual' to place a hold
//     (authorization) without capturing funds:
//       stripe.paymentIntents.create({
//         amount: amountCents,
//         currency: 'cad',
//         capture_method: 'manual',
//         application_fee_amount: computePlatformFee(amountCents),
//         transfer_data: { destination: pro.stripe_account_id },
//         metadata: { job_id: jobId },
//       })
//     Persist intent.id as payment_intent_id; status -> 'authorized'.
//
//   releaseToPro(jobId):
//     Capture the previously authorized PaymentIntent, which settles funds to
//     the connected account minus the application fee:
//       stripe.paymentIntents.capture(payment_intent_id)
//     status -> 'released'.
//
//   cancelHold(jobId):
//     Cancel an uncaptured PaymentIntent (no money moved):
//       stripe.paymentIntents.cancel(payment_intent_id)
//     status -> 'cancelled'.
//
//   refund(jobId):
//     Refund a captured charge (reverses the transfer / application fee as
//     configured):
//       stripe.refunds.create({ payment_intent: payment_intent_id })
//     status -> 'refunded'.
//
// The destination-charge model means the platform is the merchant of record:
// `application_fee_amount` is Capital Clear's cut and `transfer_data.destination`
// routes the remainder to the pro's connected `stripe_account_id`. Currency is
// always 'cad'.

const NOT_CONFIGURED: PaymentResult = {
  ok: false,
  error: 'Stripe provider not configured — set PAYMENTS_MODE=stripe and add keys',
};

export const stripeConnectProvider: PaymentProvider = {
  async authorizeHold(_jobId: string, _amountCents: number) {
    return NOT_CONFIGURED;
  },
  async releaseToPro(_jobId: string) {
    return NOT_CONFIGURED;
  },
  async cancelHold(_jobId: string) {
    return NOT_CONFIGURED;
  },
  async refund(_jobId: string) {
    return NOT_CONFIGURED;
  },
};
