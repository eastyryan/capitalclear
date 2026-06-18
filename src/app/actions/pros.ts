'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type ActionResult } from '@/lib/types';

// Pro profile management. A 'pro' user upserts their own pros row: the set of
// services they offer, their base price, service radius, and an optional bio.
// city is always pinned to 'Ottawa' (the only market). The pros_insert_self /
// pros_update_self RLS policies require user_id = auth.uid().

const serviceTypeSchema = z.enum([
  'snow_removal',
  'lawn_mowing',
  'seasonal_maintenance',
]);

const upsertProSchema = z.object({
  services: z.array(serviceTypeSchema).nonempty(),
  base_price_cents: z.number().int().min(0),
  service_radius_km: z.number().positive(),
  bio: z.string().trim().max(2000).optional(),
});

export type UpsertProProfileInput = z.input<typeof upsertProSchema>;

/**
 * Create or update the current pro's profile. Caller must have the 'pro' role.
 * Idempotent: re-running overwrites the existing pros row (keyed by user_id).
 */
export async function upsertProProfile(
  input: UpsertProProfileInput,
): Promise<ActionResult<null>> {
  const parse = upsertProSchema.safeParse(input);
  if (!parse.success) {
    return err('INVALID_PRO_PROFILE');
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('NOT_AUTHENTICATED');
    }

    // Role check: only pros may maintain a pros row.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return err('PROFILE_NOT_FOUND');
    }

    if (profile.role !== 'pro') {
      return err('NOT_A_PRO');
    }

    const { error: upsertError } = await supabase.from('pros').upsert(
      {
        user_id: user.id,
        services: parse.data.services,
        base_price_cents: parse.data.base_price_cents,
        service_radius_km: parse.data.service_radius_km,
        bio: parse.data.bio ?? null,
        city: 'Ottawa',
      },
      { onConflict: 'user_id' },
    );

    if (upsertError) {
      return err(upsertError.message);
    }

    revalidatePath('/pro');

    return ok(null);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
  }
}
