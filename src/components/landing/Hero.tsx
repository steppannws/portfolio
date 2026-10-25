import { useEffect, useRef, useState } from 'react';
import { asset } from '../../lib/asset';
import styles from './Hero.module.css';

// fonts swap in fine late, so never hold the page on them longer than this
const MAX_FONT_WAIT_MS = 4000;

const META = [
  { label: 'Role', value: 'Technical Lead' },
  { label: 'Focus', value: 'AI · Mobile · Backend · Full-stack' },
  { label: 'Based', value: 'Buenos Aires, AR — Remote' },
  { label: 'Status', value: 'Open to work', live: true },
];

export function Hero() {
  const portraitRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  // wait for the portrait and webfonts so the entrance plays once on finished content
  useEffect(() => {
    let live = true;
    // decode() settles on load or error, so the portrait wait cannot hang
    const portrait = portraitRef.current?.decode?.().catch(() => {});
    const fonts = Promise.race([
      document.fonts?.ready,
      new Promise((resolve) => setTimeout(resolve, MAX_FONT_WAIT_MS)),
    ]);
    Promise.all([portrait, fonts]).then(() => {
      if (!live) return;
      setReady(true);
      // the loader lives in index.html so it paints before any JS arrives
      document.getElementById('boot-loader')?.classList.add('done');
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section
      id="top"
      data-surface="paper"
      className={`${styles.hero} ${ready ? '' : styles.loading}`}
    >
      <div className={`shell ${styles.inner}`}>
        <div className={styles.type}>
          <h1 className={`display ${styles.name}`}>
            <span className={styles.nameBack}>Stepan</span>{' '}
            <span className={styles.nameFront}>Nikulenko</span>
          </h1>
          <p className={styles.role}>
            AI <span className="serif">&amp;</span> full-stack engineer, fifteen years
            hands-on&nbsp;— building LLM-powered, agentic products end to end.
          </p>
        </div>
        <div className={styles.portrait}>
          <img
            ref={portraitRef}
            src={asset('assets/image6-light.webp')}
            alt="Stepan Nikulenko"
            className={styles.portraitImage}
          />
        </div>
      </div>
      <div className={`shell ${styles.metaStrip}`}>
        {META.map((item) => (
          <div key={item.label} className={styles.metaCell}>
            <span className={styles.metaLabel}>{item.label}</span>
            <span className={styles.metaValue}>
              {item.live && <span className={styles.live} />}
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
