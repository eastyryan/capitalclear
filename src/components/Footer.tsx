import { Link } from "react-router-dom"
import { DEMO_LINE } from "../lib/data"

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <img src="/assets/logo.webp" alt="" className="h-7 w-7 mix-blend-multiply" />
          <span className="font-bold tracking-tight">CapitalClear</span>
        </div>
        <nav className="flex items-center gap-6 font-mono text-[13px]">
          <Link to="/request" className="text-ink-soft transition-colors hover:text-accent">
            Request
          </Link>
          <Link to="/partners" className="text-ink-soft transition-colors hover:text-accent">
            Partners
          </Link>
        </nav>
        <p className="font-mono text-[12px] text-ink-soft">{DEMO_LINE}</p>
      </div>
    </footer>
  )
}
