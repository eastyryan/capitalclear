import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import type { Database, UserRole } from '@/types/database.types';
import type { User } from '@supabase/supabase-js';

// Auth guards for Server Components, Route Handlers, and Server Actions.
// These are async (they await the SSR Supabase client) and rely on the
// locale-aware `redirect` so the active /[locale]/ prefix is preserved.

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Require an authenticated user. Redirects to /login if there is none.
 * Returns the Supabase auth user.
 */
export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    // `redirect` is overloaded, so TS won't propagate its `never` return for
    // control-flow narrowing. Throwing it terminates the function definitively
    // (the call already throws a Next.js redirect under the hood).
    throw redirect({ href: '/login', locale });
  }

  return user;
}

/**
 * Fetch the current user's profile row, or null if unauthenticated or no
 * profile exists.
 */
export async function getProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile ?? null;
}

/**
 * Require an authenticated user whose profile has the given role. Redirects
 * to /login if unauthenticated, or to / if the role doesn't match. Returns
 * the user and their profile.
 */
export async function requireRole(
  role: UserRole,
): Promise<{ user: User; profile: ProfileRow }> {
  const user = await requireUser();
  const profile = await getProfile();

  if (!profile || profile.role !== role) {
    const locale = await getLocale();
    throw redirect({ href: '/', locale });
  }

  return { user, profile };
}
