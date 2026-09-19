'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';

export function orbitalPosition(index: number, total: number, angle: number, zoom: number) {
  const radians = ((angle + (360 * index) / Math.max(total, 1) - 90) * Math.PI) / 180;
  return { x: 50 + Math.cos(radians) * 35 * zoom, y: 50 + Math.sin(radians) * 38 * zoom };
}

export function useEcosystemOrbit(stage: RefObject<HTMLDivElement | null>, externalPause: boolean) {
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const pointer = useRef<{ id: number; start: number; last: number; moved: boolean } | null>(null);
  const ignoreClick = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const layout = window.matchMedia('(min-width: 1280px)');
    const sync = () => {
      setReducedMotion(motion.matches);
      setDesktop(layout.matches);
      setVisible(document.visibilityState !== 'hidden');
    };
    sync();
    motion.addEventListener('change', sync);
    layout.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    const observer = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting));
    if (stage.current) observer.observe(stage.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', sync);
      layout.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [stage]);

  const rotating = desktop && visible && inViewport && !paused && !hovered && !focused && !dragging && !reducedMotion && !externalPause;
  useEffect(() => {
    if (!rotating) return;
    let frame: number;
    let previous: number | null = null;
    const tick = (time: number) => {
      if (previous === null) previous = time;
      const elapsed = time - previous;
      if (elapsed >= 40) {
        setAngle((value) => (value + Math.min(elapsed, 100) * 0.0024) % 360);
        previous = time;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rotating]);

  function rotate(degrees: number) {
    setAngle((value) => (value + degrees + 360) % 360);
  }
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    ignoreClick.current = false;
    if (!desktop || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if ((event.target as HTMLElement).closest('button, a')) return;
    pointer.current = { id: event.pointerId, start: event.clientX, last: event.clientX, moved: false };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = pointer.current;
    if (!current || current.id !== event.pointerId) return;
    if (Math.abs(event.clientX - current.start) > 4) current.moved = true;
    rotate((event.clientX - current.last) * 0.35);
    current.last = event.clientX;
  }
  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const current = pointer.current;
    if (!current || current.id !== event.pointerId) return;
    ignoreClick.current = current.moved;
    pointer.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return {
    angle, zoom, paused, rotating, reducedMotion, desktop, dragging,
    rotate,
    zoomBy: (delta: number) => setZoom((value) => Math.max(0.82, Math.min(1.06, Number((value + delta).toFixed(2))))),
    reset: () => { setAngle(0); setZoom(1); },
    togglePause: () => setPaused((value) => !value),
    setHovered, setFocused, startDrag, moveDrag, endDrag,
    consumeDrag: () => { const value = ignoreClick.current; ignoreClick.current = false; return value; },
  };
}
