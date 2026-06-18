'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ok, err, type ActionResult } from '@/lib/types';
import { assertOttawaPostal } from '@/lib/geo/ottawa';
import { getQuote } from '@/lib/pricing/quote';
import { canTransition, isCancellable } from '@/lib/jobs/status';
import { getPaymentProvider } from '@/lib/payments/provider';
import type { JobStatus, ServiceType } from '@/types/database.types';

// Job lifecycle Server Actions for Capital Clear.
//
// Every action follows the same skeleton:
//   1. Authenticate via supabase.auth.getUser() — no user -> err('unauthorized').
//   2. Explicit ownership / role check (RLS is a backstop, not the only gate).
//   3. Zod-validate any input.
//   4. Enforce business rules (geofence, state machine, photo gates).
//   5. Mutate the DB, run the payment side-effect, revalidate affected paths.
//   6. Return ok(data) / err(message). We NEVER throw to the client; all
//      thrown errors are caught and mapped to err(...).
//
// Paths revalidated are the literal (non-localized) route paths. next-intl
// serves these under /[locale]/..., but revalidatePath keys on the internal
// path, so '/dashboard', '/pro', and '/jobs/<id>' are correct.

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const SERVICE_TYPES = [
  'snow_removal',
  'lawn_mowing',
  'seasonal_maintenance',
] as const satisfies readonly ServiceType[];

const createJobSchema = z.object({
  service_type: z.enum(SERVICE_TYPES),
  address: z.string().trim().min(1).max(500),
  postal_code: z.string().trim().min(1).max(20),
  scheduled_for: z
    .string()
    .datetime({ offset: true })
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'invalidDate' }),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateJobInput = z.input<typeof createJobSchema>;

const jobIdSchema = z.string().uuid();

// ---------------------------------------------------------------------------
// createJob — homeowner only
// ---------------------------------------------------------------------------

/**
 * Create a posted job for the authenticated homeowner and place a payment
 * hold for the quoted amount. If the hold fails the job is rolled back to
 * 'draft' (it is never left publicly 'posted' without secured funds).
 */
export async function createJob(
  input: CreateJobInput,
): Promise<ActionResult<{ jobId: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err('unauthorized');

  // Role check: only homeowners may post jobs.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile) return err('unauthorized');
  if (profile.role !== 'homeowner') return err('forbidden');

  // Validate input.
  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) return err('invalidInput');
  const { service_type, address, postal_code, scheduled_for, notes } =
    parsed.data;

  // Geofence: Ottawa service area only.
  try {
    assertOttawaPostal(postal_code);
  } catch {
    return err('outOfArea');
  }

  // Price the job server-side; never trust a client-supplied amount.
  const quote = getQuote(service_type, scheduled_for);
  const quotedPriceCents = quote.totalCents;

  // Insert the job as 'posted' with no funds secured yet.
  let jobId: string;
  try {
    const { data: job, error: insertError } = await supabase
      .from('jobs')
      .insert({
        homeowner_id: user.id,
        service_type,
        status: 'posted',
        address,
        postal_code,
        scheduled_for,
        notes: notes ?? null,
        quoted_price_cents: quotedPriceCents,
        currency: 'CAD',
        payment_status: 'none',
      })
      .select('id')
      .single();

    if (insertError || !job) return err('createFailed');
    jobId = job.id;
  } catch {
    return err('createFailed');
  }

  // Place the payment hold. On failure, roll the job back to 'draft' so it
  // never sits in the public 'posted' pool without an authorized hold.
  try {
    const hold = await getPaymentProvider().authorizeHold(
      jobId,
      quotedPriceCents,
    );

    if (!hold.ok) {
      const admin = createAdminClient();
      await admin
        .from('jobs')
        .update({ status: 'draft', payment_status: 'none' })
        .eq('id', jobId);
      return err('paymentHoldFailed');
    }
  } catch {
    try {
      const admin = createAdminClient();
      await admin
        .from('jobs')
        .update({ status: 'draft', payment_status: 'none' })
        .eq('id', jobId);
    } catch {
      // best-effort rollback; the job stays recoverable as a draft
    }
    return err('paymentHoldFailed');
  }

  revalidatePath('/dashboard', 'page');
  return ok({ jobId });
}

// ---------------------------------------------------------------------------
// acceptJob — pro only, ATOMIC claim
// ---------------------------------------------------------------------------

/**
 * Atomically claim a posted job for the authenticated pro. The claim is a
 * single conditional UPDATE guarded by `status='posted' AND pro_id IS NULL`;
 * the database row lock guarantees exactly one pro can win the race. If the
 * UPDATE affects zero rows the job was already taken (err('alreadyTaken')).
 */
export async function acceptJob(
  jobId: string,
): Promise<ActionResult<{ jobId: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err('unauthorized');

  const parsedId = jobIdSchema.safeParse(jobId);
  if (!parsedId.success) return err('invalidInput');
  const id = parsedId.data;

  // Role check: only pros may accept jobs.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile) return err('unauthorized');
  if (profile.role !== 'pro') return err('forbidden');

  try {
    // We need the job's service_type to verify the pro offers it. Read it
    // first (cheap) so we can reject mismatches before claiming.
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('service_type, status, pro_id')
      .eq('id', id)
      .single();
    if (jobError || !job) return err('notFound');
    if (job.status !== 'posted' || job.pro_id !== null) {
      return err('alreadyTaken');
    }

    // Verify the pro actually offers this service.
    const { data: pro, error: proError } = await supabase
      .from('pros')
      .select('services')
      .eq('user_id', user.id)
      .single();
    if (proError || !pro) return err('forbidden');
    if (!pro.services.includes(job.service_type as ServiceType)) {
      return err('serviceNotOffered');
    }

    // ATOMIC claim via the service-role client. The WHERE clause is the lock:
    //   UPDATE jobs SET pro_id = <uid>, status = 'accepted'
    //   WHERE id = <id> AND status = 'posted' AND pro_id IS NULL
    // Two concurrent calls serialize on the row; the loser matches zero rows.
    const admin = createAdminClient();
    const { data: claimed, error: claimError } = await admin
      .from('jobs')
      .update({ pro_id: user.id, status: 'accepted' })
      .eq('id', id)
      .eq('status', 'posted')
      .is('pro_id', null)
      .select('id');

    if (claimError) return err('acceptFailed');
    if (!claimed || claimed.length === 0) return err('alreadyTaken');
  } catch {
    return err('acceptFailed');
  }

  revalidatePath('/pro', 'page');
  revalidatePath('/jobs/' + jobId, 'page');
  return ok({ jobId });
}

// ---------------------------------------------------------------------------
// updateJobStatus — assigned pro only
// ---------------------------------------------------------------------------

/**
 * Advance a job along the state machine. Only the assigned pro may call this,
 * the transition must be legal per LEGAL_TRANSITIONS, and moving into
 * 'in_progress' requires a 'before' photo to already exist.
 */
export async function updateJobStatus(
  jobId: string,
  nextStatus: JobStatus,
): Promise<ActionResult<{ jobId: string; status: JobStatus }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err('unauthorized');

  const parsedId = jobIdSchema.safeParse(jobId);
  if (!parsedId.success) return err('invalidInput');
  const id = parsedId.data;

  const parsedStatus = z
    .enum([
      'draft',
      'posted',
      'accepted',
      'en_route',
      'in_progress',
      'awaiting_approval',
      'completed',
      'cancelled',
    ])
    .safeParse(nextStatus);
  if (!parsedStatus.success) return err('invalidInput');
  const next = parsedStatus.data;

  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('status, pro_id')
      .eq('id', id)
      .single();
    if (jobError || !job) return err('notFound');

    // Ownership: must be the assigned pro.
    if (job.pro_id !== user.id) return err('forbidden');

    // State machine.
    if (!canTransition(job.status, next)) return err('illegalTransition');

    // Photo gate: starting work requires a 'before' photo on record.
    if (next === 'in_progress') {
      const { count, error: photoError } = await supabase
        .from('job_photos')
        .select('id', { count: 'exact', head: true })
        .eq('job_id', id)
        .eq('type', 'before');
      if (photoError) return err('updateFailed');
      if ((count ?? 0) === 0) return err('needBeforePhoto');
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ status: next })
      .eq('id', id)
      .eq('pro_id', user.id);
    if (updateError) return err('updateFailed');
  } catch {
    return err('updateFailed');
  }

  revalidatePath('/pro', 'page');
  revalidatePath('/jobs/' + jobId, 'page');
  return ok({ jobId, status: next });
}

// ---------------------------------------------------------------------------
// markComplete — assigned pro only
// ---------------------------------------------------------------------------

/**
 * The assigned pro signals work is done. Requires the job to be 'in_progress'
 * and an 'after' photo to exist. Moves the job to 'awaiting_approval' for the
 * homeowner to approve and release payment.
 */
export async function markComplete(
  jobId: string,
): Promise<ActionResult<{ jobId: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err('unauthorized');

  const parsedId = jobIdSchema.safeParse(jobId);
  if (!parsedId.success) return err('invalidInput');
  const id = parsedId.data;

  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('status, pro_id')
      .eq('id', id)
      .single();
    if (jobError || !job) return err('notFound');

    if (job.pro_id !== user.id) return err('forbidden');
    if (job.status !== 'in_progress') return err('illegalTransition');

    // Photo gate: completion requires an 'after' photo on record.
    const { count, error: photoError } = await supabase
      .from('job_photos')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', id)
      .eq('type', 'after');
    if (photoError) return err('updateFailed');
    if ((count ?? 0) === 0) return err('needAfterPhoto');

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ status: 'awaiting_approval' })
      .eq('id', id)
      .eq('pro_id', user.id);
    if (updateError) return err('updateFailed');
  } catch {
    return err('updateFailed');
  }

  revalidatePath('/pro', 'page');
  revalidatePath('/jobs/' + jobId, 'page');
  return ok({ jobId });
}

// ---------------------------------------------------------------------------
// approveCompletion — homeowner owner only
// ---------------------------------------------------------------------------

/**
 * The homeowner approves finished work. Requires status 'awaiting_approval'.
 * Releases the held payment to the pro (the provider advances payment_status),
 * then marks the job 'completed' and stamps the final price.
 */
export async function approveCompletion(
  jobId: string,
): Promise<ActionResult<{ jobId: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err('unauthorized');

  const parsedId = jobIdSchema.safeParse(jobId);
  if (!parsedId.success) return err('invalidInput');
  const id = parsedId.data;

  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('status, homeowner_id, quoted_price_cents')
      .eq('id', id)
      .single();
    if (jobError || !job) return err('notFound');

    // Ownership: must be the homeowner who created the job.
    if (job.homeowner_id !== user.id) return err('forbidden');
    if (job.status !== 'awaiting_approval') return err('illegalTransition');

    // Release the escrowed funds to the pro. The provider updates the
    // payments ledger and jobs.payment_status under service-role.
    const release = await getPaymentProvider().releaseToPro(id);
    if (!release.ok) return err('paymentReleaseFailed');

    // Finalize the job. Payment status is owned by the provider; we only set
    // the lifecycle status and stamp the final price from the quote.
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'completed',
        final_price_cents: job.quoted_price_cents,
      })
      .eq('id', id)
      .eq('homeowner_id', user.id);
    if (updateError) return err('updateFailed');
  } catch {
    return err('updateFailed');
  }

  revalidatePath('/dashboard', 'page');
  revalidatePath('/jobs/' + jobId, 'page');
  return ok({ jobId });
}

// ---------------------------------------------------------------------------
// cancelJob — homeowner owner or admin
// ---------------------------------------------------------------------------

/**
 * Cancel a job before work begins. Allowed for the owning homeowner or an
 * admin, and only while the status is cancellable (pre-'in_progress'). Voids
 * any uncaptured hold via the payment provider, then sets status 'cancelled'.
 */
export async function cancelJob(
  jobId: string,
): Promise<ActionResult<{ jobId: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err('unauthorized');

  const parsedId = jobIdSchema.safeParse(jobId);
  if (!parsedId.success) return err('invalidInput');
  const id = parsedId.data;

  // Resolve role for the admin path.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || !profile) return err('unauthorized');
  const isAdmin = profile.role === 'admin';

  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('status, homeowner_id, payment_status')
      .eq('id', id)
      .single();
    if (jobError || !job) return err('notFound');

    // Ownership: owning homeowner OR admin.
    if (!isAdmin && job.homeowner_id !== user.id) return err('forbidden');

    // Only cancellable before work is in progress.
    if (!isCancellable(job.status)) return err('notCancellable');

    // Void the hold if one was placed. The provider advances payment_status.
    if (job.payment_status === 'authorized') {
      const cancelled = await getPaymentProvider().cancelHold(id);
      if (!cancelled.ok) return err('paymentCancelFailed');
    }

    // Set status under service-role so an admin (not the row owner) can write
    // through RLS. Re-assert the cancellable precondition in the WHERE clause
    // so a concurrent transition can't slip a started job into 'cancelled'.
    const admin = createAdminClient();
    const { data: updated, error: updateError } = await admin
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .in('status', ['draft', 'posted', 'accepted', 'en_route'])
      .select('id');
    if (updateError) return err('updateFailed');
    if (!updated || updated.length === 0) return err('notCancellable');
  } catch {
    return err('updateFailed');
  }

  revalidatePath('/dashboard', 'page');
  revalidatePath('/pro', 'page');
  revalidatePath('/jobs/' + jobId, 'page');
  return ok({ jobId });
}
