import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Home, HardHat, Shield, CalendarPlus, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = { title: 'Demo · Capital Clear', robots: { index: false } };

const SCREENS: { href: string; label: string; desc: string; Icon: LucideIcon }[] = [
  { href: '/demo/homeowner', label: 'Homeowner dashboard', desc: 'A customer tracking their bookings across active, awaiting-approval, completed and cancelled.', Icon: Home },
  { href: '/demo/pro', label: 'Pro dashboard', desc: 'A contractor view: available jobs to claim, active & completed work, and an earnings panel.', Icon: HardHat },
  { href: '/demo/admin', label: 'Admin console', desc: 'Platform KPIs plus tables of jobs, users, reviews and payments.', Icon: Shield },
  { href: '/demo/book', label: 'Booking flow', desc: 'The multi-step booking wizard a homeowner uses to request a clear, with a live price quote.', Icon: CalendarPlus }
];

export default async function DemoHub({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <div className="eyebrow mb-4">Backend preview</div>
        <h1 className="text-4xl font-semibold tracking-tighter text-foreground md:text-5xl">
          What&rsquo;s built behind the login
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
          These are the real authenticated screens, shown here with sample data so you can click
          through them without a login or database. Buttons that write data (accept, approve, submit)
          won&rsquo;t do anything in the demo.
        </p>
      </div>

      <div className="mt-12 divide-y divide-[var(--cc-line)] border-t border-[var(--cc-line)]">
        {SCREENS.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between gap-6 py-5"
          >
            <div className="flex min-w-0 items-start gap-4">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cc-tint)] text-[var(--cc-accent)]">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span className="min-w-0">
                <h2 className="text-base font-medium tracking-tight text-foreground">
                  {label}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--cc-ink-soft)]">{desc}</p>
              </span>
            </div>
            <ArrowUpRight
              className="size-5 shrink-0 text-[var(--cc-ink-soft)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--cc-accent)] motion-reduce:transition-none"
              aria-hidden
            />
          </Link>
        ))}
      </div>

      <p className="mt-10 border-t border-[var(--cc-line)] pt-4 font-mono text-[11px] text-[var(--cc-ink-soft)]">
        Note: the job-detail page and the in-app write actions need the real backend, so they stay
        gated. This is a visual walkthrough of what exists.
      </p>
    </main>
  );
}
