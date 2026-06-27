import { FlaskConical } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const LINKS = [
  { href: '/demo', label: 'Overview' },
  { href: '/demo/homeowner', label: 'Homeowner' },
  { href: '/demo/pro', label: 'Pro' },
  { href: '/demo/admin', label: 'Admin' },
  { href: '/demo/book', label: 'Booking' }
];

/** Persistent notice + nav across the throwaway demo of the logged-in app. */
export function DemoBanner() {
  return (
    <div className="border-b border-amber-400/50 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
          <FlaskConical className="size-4 shrink-0" aria-hidden />
          Demo preview — sample data, not a real login.
        </p>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
