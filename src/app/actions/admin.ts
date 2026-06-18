'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { ok, err, type ActionResult } from '@/lib/types';

// Admin moderation actions. Every action is guarded by requireRole('admin')
// (which redirects non-admins) and uses the service-role admin client to write
// across users' rows, bypassing RLS. The dashboard at /admin is revalidated
// after each mutation so the tables refresh.

const uuidSchema = z.string().uuid();

/**
 * Flip a pro's `verified` flag. Admin-only. Verified pros are surfaced to
 * homeowners; unverifying hides them from new matches.
 */
export async function setProVerified(
  userId: string,
  verified: boolean,
): Promise<ActionResult<null>> {
  await requireRole('admin');

  const idParse = uuidSchema.safeParse(userId);
  if (!idParse.success) {
    return err('INVALID_USER_ID');
  }

  try {
    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from('pros')
      .update({ verified })
      .eq('user_id', userId);

    if (updateError) {
      return err(updateError.message);
    }

    revalidatePath('/admin');
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}

/**
 * Delete a review for moderation. Admin-only. Removing a review fires the
 * pro-stats recompute trigger, so the affected pro's rating_avg refreshes.
 */
export async function deleteReview(
  reviewId: string,
): Promise<ActionResult<null>> {
  await requireRole('admin');

  const idParse = uuidSchema.safeParse(reviewId);
  if (!idParse.success) {
    return err('INVALID_REVIEW_ID');
  }

  try {
    const supabase = createAdminClient();

    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      return err(deleteError.message);
    }

    revalidatePath('/admin');
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}
