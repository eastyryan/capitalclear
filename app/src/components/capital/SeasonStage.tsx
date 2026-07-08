import { useEffect, useRef } from "react";

import type { Season } from "../../lib/capital/data";
import { MapPin } from "./glyphs";

export interface PinPos {
  /** percentage of stage width */
  x: number;
  /** percentage of stage height */
  y: number;
}

interface SeasonStageProps {
  season: Season;
  pin: PinPos | null;
  /** clicks drop a pin only when provided */
  onDropPin?: (pin: PinPos) => void;
  /** paper scrim + slight blur behind sheets */
  dimmed: boolean;
  /** radar pulse around the pin while matching */
  searching: boolean;
  /** null = no truck, "driving" animates toward the pin, "parked" sits at it */
  truck: "driving" | "parked" | null;
  onTruckArrive?: () => void;
}

const DRIVE_MS = 6500;

/** Route start and bend, in stage-percent space. */
const ROUTE_START = { x: -4, y: 84 };
const ROUTE_BEND = { x: 34, y: 22 };

function bezier(t: number, pin: PinPos) {
  const u = 1 - t;
  const x = u * u * ROUTE_START.x + 2 * u * t * ROUTE_BEND.x + t * t * pin.x;
  const y = u * u * ROUTE_START.y + 2 * u * t * ROUTE_BEND.y + t * t * pin.y;
  // derivative for heading
  const dx = 2 * u * (ROUTE_BEND.x - ROUTE_START.x) + 2 * t * (pin.x - ROUTE_BEND.x);
  const dy = 2 * u * (ROUTE_BEND.y - ROUTE_START.y) + 2 * t * (pin.y - ROUTE_BEND.y);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90 };
}

export function SeasonStage({
  season,
  pin,
  onDropPin,
  dimmed,
  searching,
  truck,
  onTruckArrive,
}: SeasonStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const truckRef = useRef<HTMLDivElement>(null);
  const arriveRef = useRef(onTruckArrive);
  arriveRef.current = onTruckArrive;

  // Cursor drift on the plate: slow parallax toward the pointer. Fine-pointer
  // devices only, reduced-motion gated, transform-only.
  useEffect(() => {
    const stage = stageRef.current;
    const drift = driftRef.current;
    if (!stage || !drift) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * -14;
      ty = ((e.clientY - r.top) / r.height - 0.5) * -10;
    };
    const tick = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      drift.style.transform = `scale(1.06) translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      raf = requestAnimationFrame(tick);
    };
    stage.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Truck drive: rAF along the route bezier, then hand off to "parked".
  useEffect(() => {
    const el = truckRef.current;
    const stage = stageRef.current;
    if (!el || !stage || !pin || truck !== "driving") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const place = (t: number) => {
      const r = stage.getBoundingClientRect();
      const p = bezier(t, pin);
      el.style.transform = `translate(${((p.x / 100) * r.width).toFixed(1)}px, ${((p.y / 100) * r.height).toFixed(1)}px) translate(-50%, -50%) rotate(${p.angle.toFixed(1)}deg)`;
    };

    if (reduced) {
      place(1);
      const id = window.setTimeout(() => arriveRef.current?.(), 800);
      return () => window.clearTimeout(id);
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DRIVE_MS);
      // ease in-out
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      place(e);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        arriveRef.current?.();
      }
    };
    place(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [truck, pin]);

  // Parked truck sits just beside the pin.
  useEffect(() => {
    const el = truckRef.current;
    const stage = stageRef.current;
    if (!el || !stage || !pin || truck !== "parked") return;
    const r = stage.getBoundingClientRect();
    el.style.transform = `translate(${(((pin.x - 3) / 100) * r.width).toFixed(1)}px, ${(((pin.y + 4) / 100) * r.height).toFixed(1)}px) translate(-50%, -50%) rotate(12deg)`;
  }, [truck, pin]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onDropPin || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    onDropPin({
      x: Math.min(92, Math.max(8, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(80, Math.max(10, ((e.clientY - r.top) / r.height) * 100)),
    });
  };

  return (
    <div
      ref={stageRef}
      className={`absolute inset-0 overflow-hidden ${onDropPin ? "cursor-crosshair" : ""}`}
      onClick={handleClick}
      role={onDropPin ? "button" : undefined}
      aria-label={onDropPin ? "Choose your location on the map" : undefined}
    >
      <div ref={driftRef} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.06)" }}>
        <img
          src="/assets/plate-summer.webp"
          alt="Aerial view of the neighborhood in summer"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${season === "summer" ? "opacity-100" : "opacity-0"}`}
          draggable={false}
        />
        <img
          src="/assets/plate-winter.webp"
          alt="Aerial view of the neighborhood in winter"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${season === "winter" ? "opacity-100" : "opacity-0"}`}
          draggable={false}
        />
      </div>

      {/* Route line, drawn only while the truck exists */}
      {pin && truck && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={`M ${ROUTE_START.x} ${ROUTE_START.y} Q ${ROUTE_BEND.x} ${ROUTE_BEND.y} ${pin.x} ${pin.y}`}
            fill="none"
            stroke="var(--cc-accent)"
            strokeWidth="2"
            strokeDasharray="0.6 7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.9"
          />
        </svg>
      )}

      {/* Pin + radar */}
      {pin && (
        <div
          className="pointer-events-none absolute"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          {searching && (
            <>
              <span className="cc-radar absolute -left-8 -top-8 block h-16 w-16 rounded-full border-2 border-[var(--cc-accent)]" />
              <span className="cc-radar cc-radar-late absolute -left-8 -top-8 block h-16 w-16 rounded-full border-2 border-[var(--cc-accent)]" />
            </>
          )}
          <MapPin className="absolute -left-4 -top-9 h-9 w-8 text-[var(--cc-accent)] drop-shadow-md" />
        </div>
      )}

      {/* Truck marker */}
      {pin && truck && (
        <div ref={truckRef} className="pointer-events-none absolute left-0 top-0 will-change-transform">
          <img
            src="/assets/truck.png"
            alt=""
            aria-hidden
            className="h-12 w-12 object-contain drop-shadow-md"
            draggable={false}
          />
        </div>
      )}

      {/* Paper scrim behind sheets */}
      <div
        className={`pointer-events-none absolute inset-0 bg-[var(--cc-paper)] transition-opacity duration-500 ${dimmed ? "opacity-55" : "opacity-0"}`}
      />
    </div>
  );
}
