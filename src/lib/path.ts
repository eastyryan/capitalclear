export interface Pt {
  x: number
  y: number
}

/** Quadratic bezier helpers in percent coordinates. */
export function quadPoint(p0: Pt, c: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t
  return {
    x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
  }
}

export function quadAngle(p0: Pt, c: Pt, p1: Pt, t: number): number {
  const u = 1 - t
  const dx = 2 * u * (c.x - p0.x) + 2 * t * (p1.x - c.x)
  const dy = 2 * u * (c.y - p0.y) + 2 * t * (p1.y - c.y)
  return (Math.atan2(dy, dx) * 180) / Math.PI
}
