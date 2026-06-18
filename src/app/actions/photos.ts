'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type ActionResult } from '@/lib/types';
import type { PhotoType } from '@/types/database.types';

// Job-photo server actions. The full upload flow is:
//   1. createPhotoUploadUrl  -> assigned pro gets a signed upload URL + token
//   2. client PUTs the JPEG to that URL
//   3. attachJobPhoto        -> records the storage path in job_photos
//   4. getSignedPhotoUrls    -> participants read short-lived signed URLs
//
// Storage paths are always '<jobId>/<type>-<uuid>.jpg' so the storage RLS
// policies (0005_storage.sql) can key off the first path segment.

const BUCKET = 'job-photos';

const photoTypeSchema = z.enum(['before', 'after']);
const uuidSchema = z.string().uuid();

/**
 * Confirm the current user is the assigned pro of `jobId`. Returns the auth
 * user id on success, or an error string. Centralizes the ownership check used
 * by the upload + attach actions.
 */
async function requireAssignedPro(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'NOT_AUTHENTICATED' };
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .select('pro_id')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    return { ok: false, error: 'JOB_NOT_FOUND' };
  }

  if (job.pro_id !== user.id) {
    return { ok: false, error: 'NOT_ASSIGNED_PRO' };
  }

  return { ok: true, userId: user.id };
}

/**
 * Create a signed upload URL for a job photo. Only the assigned pro may do
 * this. The returned `path` must be passed back to attachJobPhoto after the
 * client finishes the upload.
 */
export async function createPhotoUploadUrl(
  jobId: string,
  type: PhotoType,
): Promise<ActionResult<{ path: string; token: string; signedUrl: string }>> {
  const idParse = uuidSchema.safeParse(jobId);
  if (!idParse.success) {
    return err('INVALID_JOB_ID');
  }

  const typeParse = photoTypeSchema.safeParse(type);
  if (!typeParse.success) {
    return err('INVALID_PHOTO_TYPE');
  }

  try {
    const supabase = await createClient();

    const guard = await requireAssignedPro(supabase, jobId);
    if (!guard.ok) {
      return err(guard.error);
    }

    const path = `${jobId}/${typeParse.data}-${crypto.randomUUID()}.jpg`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return err(error?.message ?? 'UPLOAD_URL_FAILED');
    }

    return ok({ path: data.path, token: data.token, signedUrl: data.signedUrl });
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}

/**
 * Record an uploaded photo against a job. Only the assigned pro may attach.
 * Expects the `path` returned by createPhotoUploadUrl.
 */
export async function attachJobPhoto(
  jobId: string,
  path: string,
  type: PhotoType,
): Promise<ActionResult<null>> {
  const idParse = uuidSchema.safeParse(jobId);
  if (!idParse.success) {
    return err('INVALID_JOB_ID');
  }

  const typeParse = photoTypeSchema.safeParse(type);
  if (!typeParse.success) {
    return err('INVALID_PHOTO_TYPE');
  }

  if (typeof path !== 'string' || path.length === 0) {
    return err('INVALID_PATH');
  }

  // Defensive: the stored path must live under this job's folder so it lines
  // up with the storage RLS policy and can never reference another job.
  if (!path.startsWith(`${jobId}/`)) {
    return err('PATH_JOB_MISMATCH');
  }

  try {
    const supabase = await createClient();

    const guard = await requireAssignedPro(supabase, jobId);
    if (!guard.ok) {
      return err(guard.error);
    }

    const { error } = await supabase.from('job_photos').insert({
      job_id: jobId,
      storage_path: path,
      type: typeParse.data,
      uploaded_by: guard.userId,
    });

    if (error) {
      return err(error.message);
    }

    revalidatePath('/jobs/' + jobId);
    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}

type SignedPhoto = { url: string; type: PhotoType };

/**
 * Mint short-lived (60-minute) signed read URLs for every photo on a job,
 * grouped into before/after. Any participant (homeowner or assigned pro) or an
 * admin may call this — access is enforced by RLS on both job_photos and
 * storage.objects.
 */
export async function getSignedPhotoUrls(
  jobId: string,
): Promise<ActionResult<{ before: SignedPhoto[]; after: SignedPhoto[] }>> {
  const idParse = uuidSchema.safeParse(jobId);
  if (!idParse.success) {
    return err('INVALID_JOB_ID');
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('NOT_AUTHENTICATED');
    }

    // RLS restricts this select to participants/admins. No row -> empty result.
    const { data: photos, error } = await supabase
      .from('job_photos')
      .select('storage_path, type')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) {
      return err(error.message);
    }

    const before: SignedPhoto[] = [];
    const after: SignedPhoto[] = [];

    const ONE_HOUR_SECONDS = 60 * 60;

    for (const photo of photos ?? []) {
      const { data: signed, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(photo.storage_path, ONE_HOUR_SECONDS);

      // Skip any object we can't sign (e.g. missing file) rather than failing
      // the whole request.
      if (signError || !signed) {
        continue;
      }

      const entry: SignedPhoto = { url: signed.signedUrl, type: photo.type };
      if (photo.type === 'before') {
        before.push(entry);
      } else {
        after.push(entry);
      }
    }

    return ok({ before, after });
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}
