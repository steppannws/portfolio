import { asset } from '../../lib/asset';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer data-surface="band" className={styles.footer}>
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
