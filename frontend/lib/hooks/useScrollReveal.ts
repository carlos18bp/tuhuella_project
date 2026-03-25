'use client';

import { useEffect, useRef } from 'react';

/**
 * Reveal elements on scroll using GSAP + ScrollTrigger.
 * Elements start visible by default. JS adds a hidden class, then GSAP animates to visible.
 * If GSAP fails to load, the hidden class is never added and elements remain visible.
 *
 * @param stagger - Delay between child animations (seconds). 0 = animate container only.
 */
export function useScrollReveal<T extends HTMLElement>(stagger = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ctx: ReturnType<typeof import('gsap')['gsap']['context']> | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const targets = stagger > 0 ? el.children : el;

      // Apply hidden class via JS (so elements stay visible if GSAP never loads)
      const elements = stagger > 0 ? Array.from(el.children) : [el];
      elements.forEach((child) => child.classList.add('scroll-reveal-hidden'));

      ctx = gsap.context(() => {
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          stagger: stagger > 0 ? stagger : undefined,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      }, el);
    })();

    return () => {
      ctx?.revert();
      // Remove hidden class on cleanup so elements are visible if re-rendered
      const elements = stagger > 0 && el ? Array.from(el.children) : el ? [el] : [];
      elements.forEach((child) => child.classList.remove('scroll-reveal-hidden'));
    };
  }, [stagger]);

  return ref;
}
