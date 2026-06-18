'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getPaymentProvider, type PaymentResult } from '@/lib/payments/provider';
import { ok, err, type ActionResult } from '@/lib/types';

// Thin server-action wrappers around the payment provider, for internal/admin
// callers and any UI that needs to drive the escrow flow outside the main job
// lifecycle (jobs.ts already calls the provider directly during transitions).
//
// Each wrapper:
//   1. authenticates,
//   2. authorizes the caller as a job participant (homeowner/pro) or admin,
//   3. delegates to the active provider,
//   4. maps the provider's PaymentResult to an ActionResult.

const uuidSchema = z.string().uuid();

/**
 * Verify the caller may act on `jobId`: they are the job's homeowner, the
 * assigned pro, or an admin. Returns the auth user id on success.
 */
async function authorizeJobParticipant(
  jobId: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'NOT_AUTHENTICATED' };
  }

  // Admins may act on any job. Resolve role first.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    return { ok: true, userId: user.id };
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .select('homeowner_id, pro_id')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    return { ok: false, error: 'JOB_NOT_FOUND' };
  }

  if (job.homeowner_id !== user.id && job.pro_id !== user.id) {
    return { ok: false, error: 'NOT_JOB_PARTICIPANT' };
  }

  return { ok: true, userId: user.id };
}

/** Map a provider PaymentResult to an ActionResult and revalidate the job. */
function toActionResult(
  jobId: string,
  result: PaymentResult,
): ActionResult<{ intentId: string }> {
  if (!result.ok) {
    return err(result.error);
  }
  revalidatePath('/jobs/' + jobId);
  return ok({ intentId: result.intentId });
}

/**
 * Authorize a manual-capture hold for `amountCents` on a job. Participant or
 * admin only.
 */
export async function authorizeHoldAction(
  jobId: string,
  amountCents: number,
): Promise<ActionResult<{ intentId: string }>> {
  if (!uuidSchema.safeParse(jobId).success) {
    return err('INVALID_JOB_ID');
  }
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return err('INVALID_AMOUNT');
  }

  try {
    const guard = await authorizeJobParticipant(jobId);
    if (!guard.ok) {
      return err(guard.error);
    }

    const result = await getPaymentProvider().authorizeHold(jobId, amountCents);
    return toActionResult(jobId, result);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}

/** Capture the hold and pay the pro. Participant or admin only. */
export async function releaseAction(
  jobId: string,
): Promise<ActionResult<{ intentId: string }>> {
  if (!uuidSchema.safeParse(jobId).success) {
    return err('INVALID_JOB_ID');
  }

  try {
    const guard = await authorizeJobParticipant(jobId);
    if (!guard.ok) {
      return err(guard.error);
    }

    const result = await getPaymentProvider().releaseToPro(jobId);
    return toActionResult(jobId, result);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}

/** Void an uncaptured hold. Participant or admin only. */
export async function cancelHoldAction(
  jobId: string,
): Promise<ActionResult<{ intentId: string }>> {
  if (!uuidSchema.safeParse(jobId).success) {
    return err('INVALID_JOB_ID');
  }

  try {
    const guard = await authorizeJobParticipant(jobId);
    if (!guard.ok) {
      return err(guard.error);
    }

    const result = await getPaymentProvider().cancelHold(jobId);
    return toActionResult(jobId, result);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}

/** Refund a captured payment. Participant or admin only. */
export async function refundAction(
  jobId: string,
): Promise<ActionResult<{ intentId: string }>> {
  if (!uuidSchema.safeParse(jobId).success) {
    return err('INVALID_JOB_ID');
  }

  try {
    const guard = await authorizeJobParticipant(jobId);
    if (!guard.ok) {
      return err(guard.error);
    }

    const result = await getPaymentProvider().refund(jobId);
    return toActionResult(jobId, result);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}
