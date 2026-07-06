import styles from './Footer.module.css';

export function Footer() {
  return (
    <>
      <div className={styles.wordmarkBand}>
        <div className={styles.wordmark}>STEPAN NIKULENKO</div>
      </div>
      <footer className={styles.footer}>
        <span className={styles.note}>© 2026 STEPAN NIKULENKO</span>
        <a href={`${import.meta.env.BASE_URL}deck.html`} className={styles.deckLink}>
          FULL PORTFOLIO DECK →
        </a>
        <span className={styles.note}>REMOTE — BUENOS AIRES, ARGENTINA</span>
      </footer>
    </>
  );
}
