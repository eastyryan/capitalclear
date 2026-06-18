import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Next.js 16 renamed the root middleware file `middleware.ts` -> `proxy.ts`
// (the next-intl import path is unchanged). This handles locale detection and
// the `/` -> `/en` redirect.
//
// PHASE 2 TARGET: extend this to also refresh the Supabase session. The pattern
// is to let next-intl create the NextResponse, then attach refreshed auth
// cookies onto that SAME response (running both naively makes one drop the
// other's cookies). Keeping this minimal now means the matcher and file
// location are already correct for that drop-in.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, Vercel internals, and files with an extension.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
