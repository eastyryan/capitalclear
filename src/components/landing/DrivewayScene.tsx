import { cn } from '@/lib/utils';

/**
 * CSS/SVG-illustrated driveway. The "cleared" asphalt base is always rendered.
 * When `withSnow` is true a snow blanket overlay is drawn on top.
 *
 * For the scroll-wipe in the hero, render the base with `withSnow={false}` and
 * stack a separate `<DrivewaySnow />` in a clip-path wrapper above it, so the
 * cleared pavement shows through as snow is wiped away.
 *
 * No external image assets — everything is gradients + SVG shapes so it works
 * offline and themes cleanly. Decorative only (aria-hidden).
 */
export function DrivewayScene({
  className,
  withSnow = false
}: {
  className?: string;
  withSnow?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border',
        className
      )}
    >
      {/* ---- CLEARED layer (sky + house + asphalt) ---- */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#1a2740_0%,#2b1f24_55%,#120d0f_100%)]" />
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* distant treeline */}
        <path
          d="M0 150 q20 -18 40 0 q22 -22 44 0 q20 -16 40 0 q24 -20 48 0 q20 -16 40 0 q24 -20 48 0 q20 -16 40 0 q22 -18 44 0 V300 H0 Z"
          fill="#161019"
          opacity="0.8"
        />
        {/* house */}
        <g>
          <rect x="232" y="92" width="120" height="78" fill="#241a1c" />
          <polygon points="226,94 292,56 358,94" fill="#2e2024" />
          <rect x="252" y="116" width="20" height="20" fill="#ff7a2f" opacity="0.85" />
          <rect x="312" y="116" width="20" height="20" fill="#ffb066" opacity="0.7" />
          <rect x="284" y="132" width="22" height="38" fill="#120d0f" />
        </g>
        {/* asphalt driveway, in perspective */}
        <polygon points="120,300 175,150 245,150 330,300" fill="#15131a" />
        <polygon points="120,300 175,150 245,150 330,300" fill="url(#asph)" />
        <line
          x1="210"
          y1="152"
          x2="225"
          y2="298"
          stroke="#3a3640"
          strokeWidth="1.5"
          strokeDasharray="6 7"
        />
        <polygon
          points="120,300 175,150 245,150 330,300"
          fill="url(#sheen)"
          opacity="0.35"
        />
        <defs>
          <linearGradient id="asph" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2630" />
            <stop offset="1" stopColor="#0f0d12" />
          </linearGradient>
          <radialGradient id="sheen" cx="0.5" cy="0.1" r="0.9">
            <stop offset="0" stopColor="#5bc8ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#5bc8ff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {withSnow && (
        <div className="absolute inset-0">
          <DrivewaySnow />
        </div>
      )}
    </div>
  );
}

/**
 * The snow blanket overlay only. Used standalone (inside a clip-path wrapper)
 * for the hero scroll-wipe, or via `DrivewayScene withSnow` for static states.
 */
export function DrivewaySnow({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0', className)} aria-hidden="true">
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <polygon points="120,300 175,150 245,150 330,300" fill="url(#snowfill)" />
        <ellipse cx="200" cy="250" rx="70" ry="16" fill="#ffffff" opacity="0.95" />
        <ellipse cx="225" cy="205" rx="44" ry="11" fill="#f1f5ff" />
        <ellipse cx="210" cy="175" rx="30" ry="8" fill="#ffffff" />
        <rect x="0" y="120" width="400" height="180" fill="url(#frostfill)" />
        <defs>
          <linearGradient id="snowfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#d8e3f5" />
          </linearGradient>
          <linearGradient id="frostfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eaf1ff" stopOpacity="0" />
            <stop offset="1" stopColor="#eaf1ff" stopOpacity="0.65" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-x-0 top-0 h-2/3 bg-[linear-gradient(180deg,rgba(234,241,255,0.75),rgba(234,241,255,0))]" />
    </div>
  );
}
