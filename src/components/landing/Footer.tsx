import { useEffect, useState } from 'react';
import { asset } from '../../lib/asset';
import { lure } from '../../lib/cameoLure';
import { Cameo } from './Cameo';
import heroStyles from './Hero.module.css';
import styles from './Footer.module.css';

// how close to the end of the page counts as "arrived"
const END_PX = 120;

export function Footer() {
  // visitors who reached the end without meeting the hero cameo (or starting the game) get a quick one here
  const [lured, setLured] = useState(false);

  useEffect(() => {
    const check = () => {
      const atEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - END_PX;
      if (atEnd && !lure.engaged && lure.launch) setLured(true);
    };
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  return (
    <footer data-surface="band" className={styles.footer}>
      {lured && (
        <button
          type="button"
          className={`${heroStyles.cameo} ${heroStyles.cameoFast} ${styles.cameo}`}
          aria-label="Start the climbing game"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            lure.engaged = true;
            setLured(false);
            lure.launch?.(rect.left + window.scrollX + rect.width / 2, rect.top + window.scrollY);
          }}
        >
          <Cameo />
          <span
            className={heroStyles.cameoSpeech}
            style={{ animationDuration: '3500ms', animationDelay: '1800ms' }}
          >
            Hey visitor, up for a climb?
          </span>
        </button>
      )}
      <div className={`shell ${styles.inner}`}>
        <span className={styles.note}>© 2026 Stepan Nikulenko</span>
        <a href={asset('deck.html')} className={styles.deckLink}>
          Full portfolio deck →
        </a>
        <span className={styles.note}>Remote — Buenos Aires, Argentina</span>
      </div>
    </footer>
  );
}
