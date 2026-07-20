// The plow route for the landing's clearing scene, traced along the actual
// road in plate-winter.webp (image space), plus the object-cover math that
// maps image coordinates to on-screen pixels for any container size.

export const PLATE = { w: 1376, h: 768 }

interface ImgPt {
  x: number // percent of image width
  y: number // percent of image height
}

// Waypoints traced down the center of the main road, then a right turn off
// the junction into the cleared driveway on the left side of the frame.
const ROAD: ImgPt[] = [
  { x: 53.2, y: -6 },
  { x: 52.6, y: 8 },
  { x: 51.6, y: 20 },
  { x: 50.3, y: 32 },
  { x: 49.2, y: 44 },
  { x: 48.4, y: 54 },
  { x: 48.0, y: 62 },
  { x: 46.6, y: 65.5 }, // junction with the driveway
  { x: 43.5, y: 64.3 },
  { x: 40.8, y: 62.6 }, // parked in the driveway
]

export const DRIVEWAY_END = ROAD[ROAD.length - 1]

export interface RoadSample extends ImgPt {
  /** heading in degrees, in (uniformly scaled) pixel space */
  angle: number
}

// Catmull-Rom interpolation between waypoints.
function catmullRom(p0: ImgPt, p1: ImgPt, p2: ImgPt, p3: ImgPt, t: number): ImgPt {
  const t2 = t * t
  const t3 = t2 * t
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 *
    (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3)
  return {
    x: f(p0.x, p1.x, p2.x, p3.x),
    y: f(p0.y, p1.y, p2.y, p3.y),
  }
}

// Pre-sample the spline densely, then build an arc-length table (in image
// pixels, so the x/y aspect difference is respected) for constant-speed travel.
const DENSE: ImgPt[] = (() => {
  const pts: ImgPt[] = []
  const per = 24
  for (let i = 0; i < ROAD.length - 1; i++) {
    const p0 = ROAD[Math.max(0, i - 1)]
    const p1 = ROAD[i]
    const p2 = ROAD[i + 1]
    const p3 = ROAD[Math.min(ROAD.length - 1, i + 2)]
    for (let j = 0; j < per; j++) {
      pts.push(catmullRom(p0, p1, p2, p3, j / per))
    }
  }
  pts.push(ROAD[ROAD.length - 1])
  return pts
})()

const LENGTHS: number[] = (() => {
  const out = [0]
  for (let i = 1; i < DENSE.length; i++) {
    const dx = ((DENSE[i].x - DENSE[i - 1].x) / 100) * PLATE.w
    const dy = ((DENSE[i].y - DENSE[i - 1].y) / 100) * PLATE.h
    out.push(out[i - 1] + Math.hypot(dx, dy))
  }
  return out
})()

const TOTAL = LENGTHS[LENGTHS.length - 1]

/** Point + heading at normalized arc length t in [0, 1]. */
export function sampleRoad(t: number): RoadSample {
  const target = Math.min(1, Math.max(0, t)) * TOTAL
  let lo = 0
  let hi = LENGTHS.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (LENGTHS[mid] < target) lo = mid + 1
    else hi = mid
  }
  const i = Math.max(1, lo)
  const seg = LENGTHS[i] - LENGTHS[i - 1] || 1
  const f = (target - LENGTHS[i - 1]) / seg
  const a = DENSE[i - 1]
  const b = DENSE[i]
  const dx = ((b.x - a.x) / 100) * PLATE.w
  const dy = ((b.y - a.y) / 100) * PLATE.h
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
  }
}

/** Evenly spaced (by arc length) samples along the whole route. */
export function roadPolyline(n = 72): RoadSample[] {
  return Array.from({ length: n + 1 }, (_, i) => sampleRoad(i / n))
}

/** object-cover mapping: image-space percent -> container pixels. */
export function coverMap(cw: number, ch: number) {
  const scale = Math.max(cw / PLATE.w, ch / PLATE.h)
  const ox = (cw - PLATE.w * scale) / 2
  const oy = (ch - PLATE.h * scale) / 2
  return (p: ImgPt) => ({
    x: ox + (p.x / 100) * PLATE.w * scale,
    y: oy + (p.y / 100) * PLATE.h * scale,
  })
}
