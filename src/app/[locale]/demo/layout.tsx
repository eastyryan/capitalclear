import type { ReactNode } from 'react';
import { DemoBanner } from './_DemoBanner';

/**
 * Wraps every /demo screen: clears the fixed navbar and shows the demo banner.
 * Throwaway preview of the authenticated app — no auth, no Supabase.
 */
export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pt-[57px]">
      <DemoBanner />
      {children}
    </div>
  );
}
