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
    <div className="border-b border-[var(--cc-line)] bg-[var(--cc-paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--cc-tint)] px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
          <FlaskConical className="size-3.5 shrink-0 text-[var(--cc-accent)]" aria-hidden />
          Demo preview — sample data, not a real login.
        </p>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1 font-mono text-xs text-[var(--cc-ink-soft)] transition-colors hover:bg-[var(--cc-tint)] hover:text-[var(--cc-ink)] motion-reduce:transition-none"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
