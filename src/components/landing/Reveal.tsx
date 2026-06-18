'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from './use-reduced-motion';

/**
 * Fades + lifts its children into view on first intersection. Under reduced
 * motion the content is shown immediately with no transform. `delay` staggers
 * grouped items (ms).
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div'
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const [intersected, setIntersected] = useState(false);

  // Reduced motion => always visible (no transform). Otherwise visible once the
  // IntersectionObserver fires. Deriving this at render means the effect only
  // calls setState from the observer callback, never synchronously on mount.
  const visible = reduced || intersected;

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <Tag
      // @ts-expect-error — ref typing across the union of tag names is safe here.
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}
