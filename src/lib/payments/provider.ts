import type { simulatedProvider } from './simulated';
import type { stripeConnectProvider } from './stripe-connect';

// Payment provider abstraction. The escrow flow has four moves:
//   authorizeHold  -> place a manual-capture hold when a job is accepted
//   releaseToPro   -> capture the hold and pay the pro on completion
//   cancelHold     -> void an uncaptured hold (job cancelled before work)
//   refund         -> refund a captured payment
// Two implementations exist: a DB-backed simulator (default) and a real
// Stripe Connect provider (selected when PAYMENTS_MODE=stripe).

export type PaymentResult =
  | { ok: true; intentId: string }
  | { ok: false; error: string };

export interface PaymentProvider {
  authorizeHold(jobId: string, amountCents: number): Promise<PaymentResult>;
  releaseToPro(jobId: string): Promise<PaymentResult>;
  cancelHold(jobId: string): Promise<PaymentResult>;
  refund(jobId: string): Promise<PaymentResult>;
}

/**
 * Platform fee in basis points (1 bp = 0.01%). Default 1500 bps = 15%.
 * Overridable via STRIPE_PLATFORM_FEE_BPS.
 */
export const PLATFORM_FEE_BPS = Number(
  process.env.STRIPE_PLATFORM_FEE_BPS ?? 1500,
);

/** Platform fee in integer cents for a given gross amount. */
export function computePlatformFee(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
}

/**
 * Resolve the active payment provider. Stripe is used only when explicitly
 * enabled; otherwise we fall back to the DB-backed simulator so the app is
 * fully functional in dev and demo environments without keys.
 *
 * Both impls are imported lazily inside the branches so the Stripe module is
 * never evaluated unless selected.
 */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENTS_MODE === 'stripe') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { stripeConnectProvider: provider } =
      require('./stripe-connect') as {
        stripeConnectProvider: typeof stripeConnectProvider;
      };
    return provider;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { simulatedProvider: provider } = require('./simulated') as {
    simulatedProvider: typeof simulatedProvider;
  };
  return provider;
}
