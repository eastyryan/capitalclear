'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { ok, err, type ActionResult } from '@/lib/types';
import type { UserRole } from '@/types/database.types';

// Phase 2 — Authentication server actions.
//
// Pattern (per SHARED CONTRACT): auth/validate -> business rules -> DB write ->
// return ActionResult. We never throw to the client; failures come back as
// err('messageKey'). The error strings are i18n keys under `Auth.*` so the
// forms can localize them (e.g. 'invalidCredentials', 'genericError').
//
// DEMO NOTE: email confirmations must be DISABLED in the Supabase project
// (Authentication -> Providers -> Email -> "Confirm email" OFF). With that off,
// supabase.auth.signUp returns an active session immediately and the user can
// proceed straight to their dashboard. `emailRedirectTo` is still passed so the
// flow also works if confirmations are later turned on.

// --- Schemas ---------------------------------------------------------------

const signUpSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  fullName: z.string().trim().min(1),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  role: z.enum(['homeowner', 'pro']),
  preferredLanguage: z.enum(['en', 'fr']),
});

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type SignUpInput = z.input<typeof signUpSchema>;
export type SignInInput = z.input<typeof signInSchema>;

// --- Helpers ---------------------------------------------------------------

/**
 * Best-effort origin for the email confirmation redirect. In Server Actions we
 * can read the forwarded host/proto headers; fall back to the configured site
 * URL or localhost so this never throws.
 */
async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

// --- Actions ---------------------------------------------------------------

/**
 * Create a new account. The `handle_new_user` Postgres trigger reads the
 * `options.data` metadata (role / full_name / phone / preferred_language) and
 * inserts the matching `profiles` row, so we do NOT insert the profile here.
 *
 * For contractors we additionally seed a `pros` row (best-effort) so the pro
 * dashboard has a record to read; homeowners get none.
 */
export async function signUp(
  input: SignUpInput
): Promise<ActionResult<{ userId: string }>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return err('genericError');
  }
  const { email, password, fullName, phone, role, preferredLanguage } =
    parsed.data;

  const supabase = await createClient();
  const origin = await resolveOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
        phone: phone ?? null,
        preferred_language: preferredLanguage,
      },
      emailRedirectTo: `${origin}/${preferredLanguage}/login`,
    },
  });

  if (error || !data.user) {
    // Surface the duplicate-account case distinctly so the form can hint the
    // user toward logging in; everything else is generic.
    if (error?.message?.toLowerCase().includes('already')) {
      return err('emailInUse');
    }
    return err('genericError');
  }

  const userId = data.user.id;

  // Seed a pros row for contractors. Best-effort: if RLS or the trigger races,
  // we don't fail the whole signup over it. The pro onboarding flow (Wave 3)
  // can fill in services / pricing later.
  if (role === 'pro') {
    await supabase
      .from('pros')
      .upsert({ user_id: userId }, { onConflict: 'user_id' });
  }

  return ok({ userId });
}

/**
 * Sign in with email + password. On success we read `profiles.role` so the
 * client can route to the correct dashboard (/dashboard, /pro, or /admin).
 */
export async function signIn(
  input: SignInInput
): Promise<ActionResult<{ role: UserRole }>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return err('invalidCredentials');
  }
  const { email, password } = parsed.data;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return err('invalidCredentials');
  }

  // Resolve the role for redirect targeting. Default to homeowner if the
  // profile row hasn't materialized yet (the trigger normally beats us here).
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const role: UserRole = profile?.role ?? 'homeowner';

  return ok({ role });
}

/**
 * Sign out and return to the (localized) landing page.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const locale = await getLocale();
  redirect({ href: '/', locale });
}
