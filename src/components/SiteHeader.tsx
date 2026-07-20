import { Link } from "react-router-dom"
import SeasonToggle from "./SeasonToggle"

const NAV = [
  { to: "/request", label: "Request", key: "request" },
  { to: "/", label: "About", key: "about" },
  { to: "/partners", label: "Partners", key: "partners" },
]

export default function SiteHeader({
  current,
  overlay = false,
}: {
  current: "request" | "about" | "partners"
  overlay?: boolean
}) {
  return (
    <header
      className={
        overlay
          ? "pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-3 p-4 sm:p-6"
          : "pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-3 p-4 sm:p-6"
      }
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-paper/90 py-2 pr-4 pl-3 shadow-[0_10px_40px_-18px_rgb(24_32_42/0.45)] ring-1 ring-line backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/logo.webp"
            alt=""
            className="h-7 w-7 mix-blend-multiply"
          />
          <span className="text-[17px] font-bold tracking-tight">
            CapitalClear
          </span>
        </Link>
        <span className="mx-2 hidden h-5 w-px bg-line sm:block" />
        <nav className="hidden items-center gap-4 font-mono text-[13px] sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={
                item.key === current
                  ? "text-accent"
                  : "text-ink-soft transition-colors hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="mx-1.5 h-5 w-px bg-line sm:mx-2" />
        <SeasonToggle />
      </div>
      <div className="pointer-events-auto hidden rounded-full bg-paper/90 px-4 py-2.5 font-mono text-[13px] text-ink-soft ring-1 ring-line backdrop-blur-md md:block">
        snow clearing, on demand
      </div>
    </header>
  )
}
