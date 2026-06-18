import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  computePlatformFee,
  type PaymentProvider,
  type PaymentResult,
} from './provider';

// DB-backed payment simulator. No external processor — it writes the same
// `payments` ledger rows and `jobs.payment_status` transitions that the real
// Stripe provider would, so the rest of the app behaves identically in dev
// and demo. Uses the service-role admin client (bypasses RLS) since it writes
// the ledger on behalf of the platform.

/**
 * Find the most recent payment row for a job (the active hold) and advance
 * both the payment row and the job to the given status. Returns the row's
 * intent_id so callers can echo it back.
 */
async function advanceLatestPayment(
  jobId: string,
  status: 'released' | 'cancelled' | 'refunded',
): Promise<PaymentResult> {
  try {
    const supabase = createAdminClient();

    const { data: payment, error: selectError } = await supabase
      .from('payments')
      .select('id, intent_id')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (selectError || !payment) {
      return { ok: false, error: selectError?.message ?? 'PAYMENT_NOT_FOUND' };
    }

    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', payment.id);

    if (updatePaymentError) {
      return { ok: false, error: updatePaymentError.message };
    }

    const { error: updateJobError } = await supabase
      .from('jobs')
      .update({ payment_status: status })
      .eq('id', jobId);

    if (updateJobError) {
      return { ok: false, error: updateJobError.message };
    }

    return { ok: true, intentId: payment.intent_id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'UNKNOWN_ERROR' };
  }
}

export const simulatedProvider: PaymentProvider = {
  async authorizeHold(jobId: string, amountCents: number): Promise<PaymentResult> {
    try {
      const supabase = createAdminClient();
      const intentId = `sim_${crypto.randomUUID()}`;
      const platformFeeCents = computePlatformFee(amountCents);

      const { error: insertError } = await supabase.from('payments').insert({
        job_id: jobId,
        provider: 'simulated',
        intent_id: intentId,
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        status: 'authorized',
      });

      if (insertError) {
        return { ok: false, error: insertError.message };
      }

      const { error: updateJobError } = await supabase
        .from('jobs')
        .update({
          payment_status: 'authorized',
          payment_intent_id: intentId,
          platform_fee_cents: platformFeeCents,
        })
        .eq('id', jobId);

      if (updateJobError) {
        return { ok: false, error: updateJobError.message };
      }

      return { ok: true, intentId };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'UNKNOWN_ERROR' };
    }
  },

  async releaseToPro(jobId: string): Promise<PaymentResult> {
    return advanceLatestPayment(jobId, 'released');
  },

  async cancelHold(jobId: string): Promise<PaymentResult> {
    return advanceLatestPayment(jobId, 'cancelled');
  },

  async refund(jobId: string): Promise<PaymentResult> {
    return advanceLatestPayment(jobId, 'refunded');
  },
};
