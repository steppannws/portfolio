import { useCallback, useEffect, useRef, useState } from 'react';

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

function parseHashIndex(count: number): number {
  const raw = window.location.hash.replace('#', '');
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(Math.max(parsed - 1, 0), count - 1);
}

export interface DeckController {
  index: number;
  scale: number;
  containerRef: React.RefObject<HTMLDivElement>;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

export function useDeckController(count: number): DeckController {
  const [index, setIndex] = useState(() => parseHashIndex(count));
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.min(Math.max(target, 0), count - 1);
      setIndex(clamped);
      window.location.hash = String(clamped + 1);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === 'PageDown' ||
        e.key === ' '
      ) {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        goTo(0);
      } else if (e.key === 'End') {
        goTo(count - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, prev, goTo, count]);

  useEffect(() => {
    const onHashChange = () => setIndex(parseHashIndex(count));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [count]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { index, scale, containerRef, goTo, next, prev };
}
