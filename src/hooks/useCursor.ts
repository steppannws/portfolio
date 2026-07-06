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
    let moveTimer = 0;
    let ringAnims: Animation[] = [];

    // ring spin speed: slow drift when idle, fast while the pointer moves
    const IDLE_SPIN_RATE = 0.45;
    const MOVING_SPIN_RATE = 3.5;

    const getRingAnims = () => {
      if (!ringAnims.length && ringRef.current) {
        ringAnims = ringRef.current.getAnimations({ subtree: true });
      }
      return ringAnims;
    };

    const setMoving = (moving: boolean) => {
      for (const el of [dotRef.current, ringRef.current]) {
        if (!el) continue;
        if (moving) el.setAttribute('data-moving', '');
        else el.removeAttribute('data-moving');
      }
      for (const anim of getRingAnims()) {
        anim.playbackRate = moving ? MOVING_SPIN_RATE : IDLE_SPIN_RATE;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      setMoving(true);
      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => setMoving(false), 160);
    };

    const onPointerDown = () => {
      dotRef.current?.setAttribute('data-pressed', '');
    };

    const onPointerUp = () => {
      dotRef.current?.removeAttribute('data-pressed');
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
      dot.style.transform = `translate(${pointerX - 7}px, ${pointerY - 7}px)`;
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      ring.style.width = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.transform = `translate(${ringX - ringSize / 2}px, ${ringY - ringSize / 2}px)`;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    document.addEventListener('mouseover', onMouseOver);
    loop();
    // defer one frame so the CSS ring animations exist before slowing them
    requestAnimationFrame(() => setMoving(false));

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(moveTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return { dotRef, ringRef };
}
