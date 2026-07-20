import type { IconId } from "../lib/data"

export default function Icon({
  id,
  size = 40,
  className = "",
}: {
  id: IconId
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`cc-icon cc-icon-${id} ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
