import { Suspense, lazy, useEffect, useRef } from 'react';
import type { ThemeMode } from '../../hooks/useTheme';
import { useParallax } from '../../hooks/useParallax';
import styles from './Hero.module.css';

const ParticleField = lazy(() =>
  import('./ParticleField').then((m) => ({ default: m.ParticleField }))
);

const STATS = ['React Native', 'Node.js', '15+ years', 'Buenos Aires based · Remote'];

interface HeroProps {
  theme: ThemeMode;
}

export function Hero({ theme }: HeroProps) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const glowRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useParallax<HTMLDivElement>(0.32, 'scroll', 620);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
      const glow = glowRef.current;
      if (glow) glow.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    };
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section id="top" className={styles.hero}>
      <Suspense fallback={<div className={styles.canvasFallback} />}>
        <ParticleField mouseRef={mouseRef} scrollRef={scrollRef} theme={theme} />
      </Suspense>
      <div ref={glowRef} className={styles.glow} />
      <div ref={heroContentRef} className={styles.content}>
        <div className={styles.kicker}>Hi, I&apos;m</div>
        <h1 className={styles.title}>
          Stepan
          <br />
          Nikulenko
          <span className={styles.titleDot}>.</span>
        </h1>
        <p className={styles.subtitle}>Hands-on software engineer &amp; technical leader.</p>
        <div className={styles.stats}>
          {STATS.map((stat, i) => (
            <span key={stat}>
              {i > 0 && <span className={styles.statSep}>/ </span>}
              {stat}
            </span>
          ))}
        </div>
      </div>
      <a href="#work" className={styles.scrollHint}>
        Scroll ↓
      </a>
    </section>
  );
}
