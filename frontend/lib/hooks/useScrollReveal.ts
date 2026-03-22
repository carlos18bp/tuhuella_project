'use client';

import { useEffect, useRef } from 'react';

/**
 * Reveal elements on scroll using GSAP + ScrollTrigger.
 * Animates from opacity 0 / translateY(40px) to visible.
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

      ctx = gsap.context(() => {
        const targets = stagger > 0 ? el.children : el;

        gsap.from(targets, {
          y: 40,
          opacity: 0,
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
    };
  }, [stagger]);

  return ref;
}
