import { useEffect, useRef } from 'react';

export function useCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    let pointerX = -100;
    let pointerY = -100;
    let ringX = -100;
    let ringY = -100;
    let ringSize = 40;
    let raf = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button')) {
        ringSize = 52;
      } else if (target.closest('[data-cursor-card]')) {
        ringSize = 64;
      } else {
        ringSize = 40;
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) return;
      dot.style.transform = `translate(${pointerX - 4}px, ${pointerY - 4}px)`;
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      ring.style.width = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.transform = `translate(${ringX - ringSize / 2}px, ${ringY - ringSize / 2}px)`;
    };

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('mouseover', onMouseOver);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return { dotRef, ringRef };
}
