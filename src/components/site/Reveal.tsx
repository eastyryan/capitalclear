'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Reveal-on-scroll primitive: fades + lifts children in the first time they
 * enter the viewport. IntersectionObserver only (no scroll listeners), CSS
 * transform/opacity only (GPU-composited), and it collapses to fully static
 * under prefers-reduced-motion. `delay` staggers siblings.
 */
export function Reveal({
  children,
  delay = 0,
  className
}: {
  children: ReactNode;
  /** Transition delay in ms — use small steps (60-120) to stagger siblings. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced motion: render final state immediately, no observer needed.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(16px)',
        transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
