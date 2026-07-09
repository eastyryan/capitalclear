import type { ReactNode } from 'react';
import { DemoBanner } from './_DemoBanner';

/**
 * Wraps every /demo screen with the demo banner. The site header is in-flow
 * on non-home pages in the Higgsfield design, so no fixed-navbar offset is
 * needed. Throwaway preview of the authenticated app — no auth, no Supabase.
 */
export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      {children}
    </div>
  );
}
