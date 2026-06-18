'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/components/landing/use-reduced-motion';

type Flake = {
  x: number;
  y: number;
  r: number; // radius
  vy: number; // fall speed
  vx: number; // horizontal drift base
  sway: number; // sway phase
  swaySpeed: number;
  alpha: number;
};

/**
 * Fixed full-screen canvas of lightweight falling snow, painted behind all
 * page content (z-index -10). Particle count scales with viewport area and is
 * capped; rendering is devicePixelRatio-aware and pauses when the tab is
 * hidden. Renders nothing when the user prefers reduced motion.
 */
export function SnowLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let rafId = 0;
    let running = true;

    const makeFlake = (initial: boolean): Flake => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : -10,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.25 + Math.random() * 0.75,
      vx: -0.25 + Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.015,
      alpha: 0.25 + Math.random() * 0.45
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Cap particle count: ~1 per 14k px², hard ceiling of 140.
      const target = Math.min(140, Math.round((width * height) / 14000));
      flakes = Array.from({ length: target }, () => makeFlake(true));
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      for (const f of flakes) {
        f.sway += f.swaySpeed;
        f.y += f.vy;
        f.x += f.vx + Math.sin(f.sway) * 0.4;

        if (f.y > height + 6) {
          Object.assign(f, makeFlake(false));
        }
        if (f.x < -6) f.x = width + 6;
        else if (f.x > width + 6) f.x = -6;

        ctx.globalAlpha = f.alpha;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafId = window.requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      running = document.visibilityState === 'visible';
      if (running) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    };

    resize();
    rafId = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-60"
    />
  );
}
