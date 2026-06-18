'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type ActionResult } from '@/lib/types';

// Review submission. A homeowner may leave exactly one review per job, and
// only after that job is 'completed'. The DB enforces both invariants:
//   - reviews.job_id is UNIQUE (one review per job)
//   - rating CHECK (between 1 and 5)
//   - the reviews_insert_homeowner RLS policy requires homeowner + completed
// Inserting a review fires recompute_pro_stats(), which refreshes the pro's
// rating_avg and total_jobs_completed.

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

/**
 * Submit a review for a completed job. Caller must be the job's homeowner.
 * Returns the new review id on success.
 */
export async function submitReview(
  jobId: string,
  rating: number,
  comment?: string,
): Promise<ActionResult<{ id: string }>> {
  const idParse = z.string().uuid().safeParse(jobId);
  if (!idParse.success) {
    return err('INVALID_JOB_ID');
  }

  const parse = reviewSchema.safeParse({ rating, comment });
  if (!parse.success) {
    return err('INVALID_REVIEW');
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('NOT_AUTHENTICATED');
    }

    // Load the job to verify ownership + completion and to resolve pro_id.
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('homeowner_id, pro_id, status')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return err('JOB_NOT_FOUND');
    }

    if (job.homeowner_id !== user.id) {
      return err('NOT_JOB_OWNER');
    }

    if (job.status !== 'completed') {
      return err('JOB_NOT_COMPLETED');
    }

    if (!job.pro_id) {
      return err('JOB_HAS_NO_PRO');
    }

    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        job_id: jobId,
        reviewer_id: user.id,
        pro_id: job.pro_id,
        rating: parse.data.rating,
        comment: parse.data.comment ?? null,
      })
      .select('id')
      .single();

    if (insertError || !review) {
      // Unique violation (23505) => a review already exists for this job.
      if (insertError?.code === '23505') {
        return err('ALREADY_REVIEWED');
      }
      return err(insertError?.message ?? 'REVIEW_INSERT_FAILED');
    }

    revalidatePath('/jobs/' + jobId);
    revalidatePath('/dashboard');

    return ok({ id: review.id });
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}
