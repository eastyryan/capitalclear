import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server (anon) client for Server Components, Route Handlers, and Server
// Actions. Subject to RLS. Next.js 16: cookies() is async and must be awaited.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll was called from a Server Component (cookies are read-only
            // there). Safe to ignore — the proxy refreshes the session (PHASE 2).
          }
        }
      }
    }
  );
}
