import type { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/**
 * Shared marketing primitives — Capital Clear design system. Paper surfaces,
 * ink typography (Outfit, tracking-tighter), IBM Plex Mono for eyebrows /
 * numerals, flat bordered + tint cards, accent buttons with press animation
 * and arrow-slide. No glassmorphism, no gradients (photo scrims excepted).
 */

/** @deprecated Gradients are out of the design system — renders nothing. */
export function EmberGlow() {
  return null;
}

/** Arrow used inside `group` links/buttons — slides right on hover. */
export function ArrowSlide({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 16"
      fill="none"
      className={`h-4 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none ${className ?? ''}`}
    >
      <path d="M2 8h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M12 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Solid accent button/link with press animation + arrow-slide. */
export function PrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-lg bg-[var(--cc-accent)] px-5 py-2.5 text-sm font-medium text-[var(--cc-accent-ink)] transition-transform duration-100 hover:brightness-110 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
    >
      {children} <ArrowSlide />
    </Link>
  );
}

/** Quiet bordered secondary link. */
export function GhostCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--cc-line)] px-5 py-2.5 text-sm font-medium text-[var(--cc-ink)] transition-colors duration-150 hover:border-[var(--cc-ink-soft)] motion-reduce:transition-none"
    >
      {children}
    </Link>
  );
}

/** Flat tint icon badge. */
export function IconChip({ Icon, className }: { Icon: LucideIcon; className?: string }) {
  return (
    <div
      className={`flex size-11 items-center justify-center rounded-lg bg-[var(--cc-tint)] text-[var(--cc-accent)] ${className ?? ''}`}
    >
      <Icon className="size-6" />
    </div>
  );
}

/** Mono numbered step badge. */
export function NumberBadge({ n }: { n: number }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-lg border border-[var(--cc-line)] font-mono text-sm text-[var(--cc-accent)]">
      {String(n).padStart(2, '0')}
    </span>
  );
}

/** Checklist row. */
export function Feature({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        className="mt-1 size-3.5 shrink-0 text-[var(--cc-accent)]"
      >
        <path
          d="M2.5 8.5l3.5 3.5 7.5-8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm leading-snug text-[var(--cc-ink-soft)]">{children}</span>
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
    <div className={`overflow-hidden rounded-xl border border-[var(--cc-line)] ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

/**
 * Page hero. With `image`, a rounded-xl photo band with a bottom scrim and
 * white type. Without it, a flat left-aligned paper hero: mono eyebrow +
 * tracking-tighter headline. Header is in-flow now — no fixed-header offset.
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
      <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-8">
        <div className="relative overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt ?? ''}
            className="aspect-[16/10] w-full object-cover sm:aspect-[16/7]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 pb-6 pt-20 sm:px-8">
            <div className="font-mono text-[11px] uppercase tracking-wide text-white/80">
              {eyebrow}
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tighter text-white sm:text-6xl">
              {title}
              {accent ? <> {accent}</> : null}
            </h1>
          </div>
        </div>
        {subtitle || children ? (
          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            {subtitle ? (
              <p className="max-w-[44ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
                {subtitle}
              </p>
            ) : null}
            {children ? <div className="flex flex-wrap items-center gap-4">{children}</div> : null}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 pt-10 sm:px-8 sm:pt-14">
      <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
        {eyebrow}
      </div>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tighter text-[var(--cc-ink)] sm:text-5xl">
        {title}
        {accent ? <> {accent}</> : null}
      </h1>
      {subtitle ? (
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
          {subtitle}
        </p>
      ) : null}
      {children ? <div className="mt-7 flex flex-wrap items-center gap-4">{children}</div> : null}
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
    <section className={`relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-8 sm:py-16 ${className ?? ''}`}>
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
    <div className="max-w-3xl border-t border-[var(--cc-line)] pt-8">
      {eyebrow ? (
        <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-[var(--cc-ink-soft)]">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tighter text-[var(--cc-ink)] sm:text-3xl">
        {title}
        {accent ? <> {accent}</> : null}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-[var(--cc-ink-soft)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** Flat bordered card (formerly glass). Pass `bg-[var(--cc-tint)]` for tint. */
export function GlassCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--cc-line)] bg-white/60 p-6 text-[var(--cc-ink)] ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

/** Deep-colour closing band with white type and arrow CTA. */
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
    <section className="mt-8 bg-[var(--cc-deep)] py-14 text-white sm:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-10 px-4 sm:px-8">
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="mt-4 text-base leading-relaxed text-white/75">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={primaryHref}
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-[var(--cc-deep)] transition-transform duration-100 active:translate-y-[1px] active:scale-[0.97] motion-reduce:transition-none"
          >
            {primaryLabel} <ArrowSlide />
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="group inline-flex items-center gap-2 font-mono text-xs text-white/75 transition-colors duration-150 hover:text-white motion-reduce:transition-none"
            >
              {secondaryLabel} <ArrowSlide />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
