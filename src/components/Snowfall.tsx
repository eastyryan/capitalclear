import { useEffect, useRef } from "react"

interface Flake {
  x: number
  y: number
  r: number
  vy: number
  vx: number
  drift: number
  phase: number
}

/** Lightweight canvas snowfall. DPR-aware, pauses off-screen, respects
    reduced motion by not rendering at all. */
export default function Snowfall({
  density = 70,
  className = "",
}: {
  density?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let running = false
    let flakes: Flake[] = []
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      if (!canvas) return
      const { clientWidth: w, clientHeight: h } = canvas
      canvas.width = w * dpr
      canvas.height = h * dpr
      const count = Math.round((density * (w * h)) / (1440 * 800))
      flakes = Array.from({ length: Math.max(24, count) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.9,
        vy: 0.25 + Math.random() * 0.7,
        vx: -0.15 + Math.random() * 0.3,
        drift: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    function frame(t: number) {
      if (!canvas || !ctx) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "rgba(255,255,255,0.85)"
      for (const f of flakes) {
        f.y += f.vy
        f.x += f.vx + Math.sin(t / 1400 + f.phase) * f.drift * 0.4
        if (f.y > h + 4) {
          f.y = -4
          f.x = Math.random() * w
        }
        if (f.x > w + 4) f.x = -4
        if (f.x < -4) f.x = w + 4
        ctx.globalAlpha = 0.35 + f.r / 3
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (running) return
      running = true
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    )
    io.observe(canvas)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
    }
  }, [density])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
