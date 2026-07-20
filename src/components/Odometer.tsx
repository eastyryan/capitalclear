const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/** Rolling mono digits, odometer style. Renders "$" + one rolling column
    per digit. Columns animate via transform so the meter reads like a taxi
    fare ticking over. */
export default function Odometer({
  value,
  className = "",
}: {
  value: number
  className?: string
}) {
  const chars = String(value).split("")
  return (
    <span className={`font-mono tabular-nums ${className}`} aria-label={`$${value}`}>
      <span aria-hidden="true">$</span>
      {chars.map((ch, i) => (
        <span key={`${chars.length}-${i}`} className="odo-col" aria-hidden="true">
          <span
            className="odo-strip"
            style={{ transform: `translateY(-${Number(ch)}em)` }}
          >
            {DIGITS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}
