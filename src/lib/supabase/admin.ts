import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Service-role client. BYPASSES RLS — server-only. The `server-only` import
// turns any accidental client-side import into a build error so the key can
// never reach the browser bundle. Use only in trusted server code (e.g. the
// payments ledger writes in later phases).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
