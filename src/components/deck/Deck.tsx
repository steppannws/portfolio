import { useEffect } from 'react';
import { useDeckController } from '../../hooks/useDeckController';
import { SLIDES } from './slides';
import { DeckNav } from './DeckNav';
import styles from './Deck.module.css';

export function Deck() {
  const { index, scale, containerRef, goTo, next, prev } = useDeckController(SLIDES.length);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <div ref={containerRef} className={styles.viewport}>
      <div className={styles.stage} style={{ transform: `scale(${scale})` }}>
        {SLIDES[index].element}
      </div>
      <DeckNav index={index} count={SLIDES.length} onPrev={prev} onNext={next} onGoTo={goTo} />
    </div>
  );
}
