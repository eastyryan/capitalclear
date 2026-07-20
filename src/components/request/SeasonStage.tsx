import { useEffect, useRef } from "react"
import { quadAngle, quadPoint, type Pt } from "../../lib/path"
import { useSeason } from "../../lib/season"
import MapPin from "../MapPin"

export const DRIVE_MS = 4500
const TRUCK_START: Pt = { x: -8, y: 24 }

/** The living map plate: full-bleed aerial, tap-to-pin, radar search rings,
    and the truck that drives in during tracking. */
export default function SeasonStage({
  pin,
  onPin,
  searching,
  driving,
  onArrive,
  cleared,
  flowActive,
}: {
  pin: Pt | null
  onPin: (p: Pt) => void
  searching: boolean
  driving: boolean
  onArrive: () => void
  cleared: boolean
  /** false while the customer is still on the request sheet */
  flowActive: boolean
}) {
  const { season } = useSeason()
  const root = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const truck = useRef<HTMLImageElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const route = useRef<SVGPathElement>(null)
  const swath = useRef<SVGPathElement>(null)
  const arrivedRef = useRef(onArrive)
  arrivedRef.current = onArrive

  // Cursor parallax drift (desktop only, reduced-motion gated).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(pointer: coarse)").matches) return
    const el = root.current
    if (!el) return
    let raf = 0
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window
      const dx = (e.clientX / w - 0.5) * -14
      const dy = (e.clientY / h - 0.5) * -10
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (plate.current) {
          plate.current.style.transform = `scale(1.06) translate(${dx}px, ${dy}px)`
        }
      })
    }
    el.addEventListener("mousemove", onMove)
    return () => {
      el.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Back on the request sheet: wipe the previous run's route, swath, truck.
  useEffect(() => {
    if (flowActive) return
    if (truck.current) truck.current.style.opacity = "0"
    if (swath.current) swath.current.style.strokeDashoffset = "1"
    if (route.current) route.current.style.opacity = "0"
  }, [flowActive])

  // Truck drive-in when tracking starts.
  useEffect(() => {
    if (!driving || !pin) return
    const dest = pin
    const ctrl: Pt = {
      x: (TRUCK_START.x + dest.x) / 2,
      y: Math.min(TRUCK_START.y, dest.y) + 22,
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (swath.current && route.current && svg.current && root.current) {
      const { clientWidth: w, clientHeight: h } = root.current
      svg.current.setAttribute("viewBox", `0 0 ${w} ${h}`)
      const px = (p: Pt) => `${(p.x / 100) * w} ${(p.y / 100) * h}`
      const d = `M ${px(TRUCK_START)} Q ${px(ctrl)} ${px(dest)}`
      swath.current.setAttribute("d", d)
      route.current.setAttribute("d", d)
      route.current.style.opacity = "0.9"
    }
    let raf = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const raw = Math.min(1, (now - t0) / DRIVE_MS)
      const t = reduced ? 1 : 1 - Math.pow(1 - raw, 2.2)
      const pos = quadPoint(TRUCK_START, ctrl, dest, t)
      const ang = quadAngle(TRUCK_START, ctrl, dest, Math.min(t, 0.999))
      if (truck.current) {
        truck.current.style.left = `${pos.x}%`
        truck.current.style.top = `${pos.y}%`
        truck.current.style.opacity = "1"
        truck.current.style.transform = `translate(-50%,-50%) rotate(${ang + 90}deg)`
      }
      if (swath.current) swath.current.style.strokeDashoffset = String(1 - t)
      if (raw < 1 && !reduced) {
        raf = requestAnimationFrame(step)
      } else {
        arrivedRef.current()
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [driving, pin])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    onPin({
      x: Math.min(92, Math.max(8, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(80, Math.max(10, ((e.clientY - rect.top) / rect.height) * 100)),
    })
  }

  return (
    <div
      ref={root}
      className="absolute inset-0 overflow-hidden"
      onClick={handleClick}
      role="button"
      aria-label="Tap your driveway on the map to set your location"
      tabIndex={-1}
    >
      <div
        ref={plate}
        className="absolute inset-0 scale-[1.06] transition-transform duration-300 ease-out will-change-transform"
      >
        <img
          src="/assets/plate-winter.webp"
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            season === "winter" ? "opacity-100" : "opacity-0"
          }`}
          draggable={false}
        />
        <img
          src="/assets/plate-summer.webp"
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            season === "summer" ? "opacity-100" : "opacity-0"
          }`}
          draggable={false}
        />
      </div>

      {/* Route line + plowed swath behind the truck */}
      <svg
        ref={svg}
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path
          ref={route}
          d=""
          fill="none"
          stroke="#2b5fb8"
          strokeWidth="4"
          strokeDasharray="0.1 14"
          strokeLinecap="round"
          opacity="0"
        />
        <path
          ref={swath}
          d=""
          fill="none"
          stroke="rgb(96 118 142 / 0.4)"
          strokeWidth="22"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
          style={{ mixBlendMode: "multiply" }}
        />
      </svg>

      {pin && (
        <div
          className="pointer-events-none absolute z-10"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          {/* Radar rings while matching */}
          {searching && (
            <>
              <span className="cc-radar absolute -top-10 -left-10 block h-20 w-20 rounded-full border-2 border-accent/70" />
              <span className="cc-radar cc-radar-late absolute -top-10 -left-10 block h-20 w-20 rounded-full border-2 border-accent/50" />
            </>
          )}
          {cleared && (
            <span
              className="absolute block h-[64px] w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5a7186]/55 mix-blend-multiply blur-[2px]"
              aria-hidden="true"
            />
          )}
          <div className="cc-pin-drop absolute" style={{ transform: "translate(-50%,-100%)" }}>
            <MapPin size={38} />
          </div>
        </div>
      )}

      <img
        ref={truck}
        src="/assets/truck.png"
        alt=""
        className="pointer-events-none absolute z-10 w-14 opacity-0 drop-shadow-[0_6px_12px_rgb(24_32_42/0.35)]"
        style={{ left: "-8%", top: "24%" }}
        draggable={false}
      />
    </div>
  )
}
