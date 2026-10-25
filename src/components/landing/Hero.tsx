import { useEffect, useRef, useState } from 'react';
import { asset } from '../../lib/asset';
import { toggleClimber } from '../../lib/climber';
import styles from './Hero.module.css';

// fonts swap in fine late, so never hold the page on them longer than this
const MAX_FONT_WAIT_MS = 4000;

const META = [
  { label: 'Role', value: 'Technical Lead' },
  { label: 'Focus', value: 'AI · Mobile · Backend · Full-stack' },
  { label: 'Based', value: 'Buenos Aires, AR — Remote' },
  { label: 'Status', value: 'Open to work', live: true },
];

// the face, in the portrait's source pixels (1280×720)
const FACE = { left: 190, top: 30, right: 390, bottom: 260 };

/** Maps a viewport point on the portrait (object-fit: cover, anchored 0% 100%) back to the face. */
export function isOnFace(img: HTMLImageElement, x: number, y: number): boolean {
  const rect = img.getBoundingClientRect();
  const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
  const sourceX = (x - rect.left) / scale;
  const sourceY = (y - rect.top - (rect.height - img.naturalHeight * scale)) / scale;
  return (
    sourceX >= FACE.left && sourceX <= FACE.right && sourceY >= FACE.top && sourceY <= FACE.bottom
  );
}

export function Hero() {
  const portraitRef = useRef<HTMLImageElement>(null);
  const surnameRef = useRef<HTMLSpanElement>(null);
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
            <span ref={surnameRef} className={styles.nameFront}>
              Nikulenko
            </span>
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
            data-climber-ignore
            // easter egg: tap the face and a pixel mountaineer drops onto the surname
            onClick={(event) => {
              if (!surnameRef.current) return;
              if (!isOnFace(event.currentTarget, event.clientX, event.clientY)) return;
              void toggleClimber({
                anchor: surnameRef.current,
                pageX: event.pageX,
                pageY: event.pageY,
              });
            }}
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
