import type { ReactNode } from 'react';
import { ArrowUpRight, Check, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/**
 * Shared marketing primitives — LIGHT theme. Warm-white surfaces, dark ink,
 * Instrument Serif italic display + Barlow body, ember accents, and real
 * snow photography. Pages compose these so they carry minimal raw styling.
 */

/** Soft warm radial wash behind light hero / CTA bands. */
export function EmberGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          'radial-gradient(55% 45% at 50% 0%, rgba(77,134,224,0.12) 0%, rgba(77,134,224,0) 60%), radial-gradient(40% 38% at 85% 10%, rgba(79,138,103,0.08) 0%, rgba(79,138,103,0) 60%)'
      }}
    />
  );
}

export function PrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="bg-gradient-ember inline-flex items-center gap-2 rounded-full px-6 py-3 font-barlow text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
    >
      {children} <ArrowUpRight className="size-4" />
    </Link>
  );
}

export function GhostCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-barlow text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {children}
    </Link>
  );
}

/** Ember gradient icon badge. */
export function IconChip({ Icon, className }: { Icon: LucideIcon; className?: string }) {
  return (
    <div
      className={`chip-ember flex size-11 items-center justify-center rounded-[0.85rem] shadow-sm ${className ?? ''}`}
    >
      <Icon className="size-6" />
    </div>
  );
}

/** Numbered step badge. */
export function NumberBadge({ n }: { n: number }) {
  return (
    <span className="surface-soft flex size-10 items-center justify-center rounded-full font-instrument text-2xl italic text-primary">
      {n}
    </span>
  );
}

/** Checklist row. */
export function Feature({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className="mt-0.5 size-4 shrink-0 text-brand-green" />
      <span className="font-barlow text-sm font-light leading-snug text-muted-foreground">
        {children}
      </span>
    </li>
  );
}

/** Rounded, framed photo. */
export function PhotoFrame({
  src,
  alt,
  className
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[1.25rem] border border-border shadow-sm ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

/**
 * Page hero. With `image`, renders a cinematic photo band (white text over a
 * darkened snow photo). Without it, a clean light hero (dark ink + ember wash).
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  subtitle,
  image,
  imageAlt,
  children
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  if (image) {
    return (
      <section className="relative overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={imageAlt ?? ''}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,8,9,0.55) 0%, rgba(10,8,9,0.25) 40%, rgba(10,8,9,0.65) 100%)'
          }}
        />
        <div className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-36 text-center sm:pt-44">
          <div className="mb-5 font-barlow text-sm tracking-wide text-white/80 tshadow">
            // {eyebrow}
          </div>
          <h1 className="font-instrument text-5xl italic leading-[0.92] tracking-[-2px] text-white tshadow md:text-7xl">
            {title}
            {accent ? (
              <>
                {' '}
                <span className="text-ember">{accent}</span>
              </>
            ) : null}
          </h1>
          {subtitle ? (
            <p className="mx-auto mt-6 max-w-2xl font-barlow text-base font-light leading-relaxed text-white/90 tshadow">
              {subtitle}
            </p>
          ) : null}
          {children ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">{children}</div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <EmberGlow />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-32 text-center sm:pt-36">
        <div className="mb-5 font-barlow text-sm tracking-wide text-muted-foreground">
          // {eyebrow}
        </div>
        <h1 className="font-instrument text-5xl italic leading-[0.92] tracking-[-2px] text-foreground md:text-7xl">
          {title}
          {accent ? (
            <>
              {' '}
              <span className="text-ember">{accent}</span>
            </>
          ) : null}
        </h1>
        {subtitle ? (
          <p className="mx-auto mt-6 max-w-2xl font-barlow text-base font-light leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        {children ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">{children}</div>
        ) : null}
      </div>
    </section>
  );
}

export function Section({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative mx-auto max-w-6xl px-6 py-20 ${className ?? ''}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  subtitle
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <div className="mb-4 font-barlow text-sm tracking-wide text-muted-foreground">
          // {eyebrow}
        </div>
      ) : null}
      <h2 className="font-instrument text-4xl italic leading-[0.95] tracking-[-1px] text-foreground md:text-5xl">
        {title}
        {accent ? (
          <>
            {' '}
            <span className="text-ember">{accent}</span>
          </>
        ) : null}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-2xl font-barlow text-base font-light leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** Light elevated card. */
export function GlassCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`surface-card rounded-[1.25rem] p-6 text-foreground ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function CtaBand({
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}: {
  title: string;
  subtitle?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden border-t border-border bg-background">
      <EmberGlow />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-instrument text-4xl italic leading-[0.95] tracking-[-1px] text-foreground md:text-5xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-xl font-barlow text-base font-light leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <PrimaryCta href={primaryHref}>{primaryLabel}</PrimaryCta>
          {secondaryHref && secondaryLabel ? (
            <GhostCta href={secondaryHref}>{secondaryLabel}</GhostCta>
          ) : null}
        </div>
      </div>
    </section>
  );
}
