import { useEffect, useRef } from 'react';

export type ParallaxMode = 'scroll' | 'position';

export function useParallax<T extends HTMLElement>(
  factor: number,
  mode: ParallaxMode = 'scroll',
  fadeDistance?: number
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      if (mode === 'scroll') {
        const offset = window.scrollY * factor;
        el.style.transform = `translateY(${offset}px)`;
        if (fadeDistance) {
          el.style.opacity = String(Math.max(0, 1 - window.scrollY / fadeDistance));
        }
      } else {
        const rect = el.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${centerOffset * factor}px)`;
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [factor, mode, fadeDistance]);

  return ref;
}
