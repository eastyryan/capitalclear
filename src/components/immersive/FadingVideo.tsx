'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from './use-reduced-motion';

type Props = {
  src: string;
  poster?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Full-bleed background video with a requestAnimationFrame crossfade and a
 * manual loop (fades out near the end, restarts, fades back in). The poster is
 * an always-visible background layer; the video fades in over it once buffered.
 * Under prefers-reduced-motion the video is never mounted — only the static
 * poster shows.
 */
export function FadingVideo({ src, poster, className, style }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const showVideo = mounted && !reduced;

  useEffect(() => {
    if (!showVideo) return;
    const v = ref.current;
    if (!v) return;
    const FADE_MS = 500;
    const FADE_OUT_LEAD = 0.55;
    let started = false;

    const fadeTo = (target: number, duration: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const from = parseFloat(v.style.opacity || '0');
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        v.style.opacity = String(from + (target - from) * t);
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const onReady = () => {
      if (started) return;
      started = true;
      v.style.opacity = '0';
      void v.play().catch(() => {});
      fadeTo(1, FADE_MS);
    };
    const onTime = () => {
      if (
        !fadingOutRef.current &&
        v.duration &&
        v.duration - v.currentTime <= FADE_OUT_LEAD &&
        v.duration - v.currentTime > 0
      ) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };
    const onEnded = () => {
      v.style.opacity = '0';
      setTimeout(() => {
        v.currentTime = 0;
        void v.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };

    v.addEventListener('loadeddata', onReady);
    v.addEventListener('canplay', onReady);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    try {
      v.load();
    } catch {
      /* noop */
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      v.removeEventListener('loadeddata', onReady);
      v.removeEventListener('canplay', onReady);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnded);
    };
  }, [showVideo, src]);

  return (
    <>
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} className={className} style={style} alt="" aria-hidden="true" />
      )}
      {showVideo && (
        <video
          ref={ref}
          src={src}
          autoPlay
          muted
          playsInline
          preload="auto"
          className={className}
          style={{ ...style, opacity: 0 }}
        />
      )}
    </>
  );
}
