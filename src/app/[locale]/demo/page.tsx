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
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 font-barlow text-sm tracking-wide text-muted-foreground">// Backend preview</div>
        <h1 className="font-instrument text-4xl italic leading-[0.95] tracking-[-1px] text-foreground md:text-5xl">
          What&rsquo;s built behind the <span className="text-ember">login</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-barlow text-base font-light leading-relaxed text-muted-foreground">
          These are the real authenticated screens, shown here with sample data so you can click
          through them without a login or database. Buttons that write data (accept, approve, submit)
          won&rsquo;t do anything in the demo.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SCREENS.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="surface-card group flex flex-col rounded-[1.25rem] p-6 transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="chip-ember flex size-11 items-center justify-center rounded-[0.85rem] shadow-sm">
                <Icon className="size-6" />
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <h2 className="mt-5 font-instrument text-2xl italic leading-none tracking-[-0.5px] text-foreground">
              {label}
            </h2>
            <p className="mt-2 font-barlow text-sm font-light leading-relaxed text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center font-barlow text-xs text-muted-foreground">
        Note: the job-detail page and the in-app write actions need the real backend, so they stay
        gated. This is a visual walkthrough of what exists.
      </p>
    </main>
  );
}
