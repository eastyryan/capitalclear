/** Accent map pin, tip at (12, 22) of the 24x24 viewBox. */
export default function MapPin({ size = 36 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className="drop-shadow-[0_4px_8px_rgb(24_32_42/0.35)]"
    >
      <path
        d="M12 2C7.9 2 4.5 5.4 4.5 9.5 4.5 15.1 12 22 12 22s7.5-6.9 7.5-12.5C19.5 5.4 16.1 2 12 2z"
        style={{ fill: "var(--cc-accent)", stroke: "var(--cc-ink)" }}
        strokeWidth="1"
      />
      <circle cx="12" cy="9.5" r="3" style={{ fill: "var(--cc-paper)" }} />
    </svg>
  )
}
