import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

// Next.js 16 renamed the root middleware file `middleware.ts` -> `proxy.ts`.
// This composes TWO concerns onto ONE NextResponse:
//
//   1. next-intl locale routing (detection + `/` -> `/en` redirect).
//   2. Supabase auth-session refresh (rotates the access/refresh cookies so
//      Server Components and Server Actions see a valid session).
//
// The critical detail: both want to write cookies. If you run them
// independently each creates its own NextResponse and the second clobbers the
// first's Set-Cookie headers. So we let next-intl build the response, then make
// the Supabase client read cookies from the *request* and write them onto that
// *same* response object.
//
// After refreshing, we also gate the protected path prefixes: an unauthenticated
// visitor to /dashboard, /book, /pro, /admin, or /jobs is bounced to the
// localized /login page. Fine-grained role checks live in the route-group
// layouts (requireRole); this is just the coarse authed/anonymous gate.

const handleI18n = createMiddleware(routing);

const PROTECTED_PREFIXES = ['/dashboard', '/book', '/pro', '/admin', '/jobs'];

/** Strip the leading `/en` or `/fr` segment, returning { locale, rest }. */
function splitLocale(pathname: string): { locale: string; rest: string } {
  const segments = pathname.split('/');
  // segments[0] is '' (leading slash); segments[1] is the locale (or not).
  const maybeLocale = segments[1];
  if ((routing.locales as readonly string[]).includes(maybeLocale)) {
    return { locale: maybeLocale, rest: '/' + segments.slice(2).join('/') };
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

export default async function proxy(request: NextRequest) {
  // 1. Locale routing first. This may itself be a redirect/rewrite response;
  //    either way it carries the cookies/headers we must preserve.
  const response = handleI18n(request);

  // If Supabase isn't configured (e.g. local demo with no backend), skip auth
  // refresh and the protected-route gate entirely so the public site still
  // renders instead of 500-ing on a blank-URL client.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  // 2. Refresh the Supabase session, writing rotated cookies onto `response`.
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Mirror onto the request (so any downstream read in this pass sees
            // the new value) and onto the response (so the browser persists it).
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Coarse auth gate for protected path prefixes.
  const { locale, rest } = splitLocale(request.nextUrl.pathname);
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => rest === prefix || rest.startsWith(prefix + '/')
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.search = '';
    // Preserve cookies refreshed above by copying them onto the redirect.
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  // Skip API routes, Next internals, Vercel internals, and files with an extension.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
