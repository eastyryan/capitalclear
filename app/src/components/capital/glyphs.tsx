/**
 * Tiny functional glyphs (star, chevron, arrow) drawn inline — the dense
 * functional fallback allowed alongside the generated icon sheet. Decorative
 * service icons come from the generated sprite via <CCIcon>.
 */

export function CCIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span aria-hidden className={`cc-icon cc-icon-${name} ${className}`} />;
}

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="currentColor">
      <path d="M8 1.5l1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1l-3.9 2.2.9-4.3-3.3-3 4.4-.5z" />
    </svg>
  );
}

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 16"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8h15" />
      <path d="M12 3l5 5-5 5" />
    </svg>
  );
}

export function Monogram({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle
        cx="20"
        cy="20"
        r="18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontFamily="var(--cc-font-mono)"
        fontSize="13"
        fill="currentColor"
      >
        {initials}
      </text>
    </svg>
  );
}

export function MapPin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden>
      <path
        d="M16 1.5c-8 0-14 6-14 13.5 0 9.8 12.2 22.4 13.3 23.5a1 1 0 001.4 0C17.8 37.4 30 24.8 30 15 30 7.5 24 1.5 16 1.5z"
        fill="currentColor"
      />
      <circle cx="16" cy="15" r="5.5" fill="var(--cc-paper)" />
    </svg>
  );
}
