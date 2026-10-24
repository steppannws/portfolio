import styles from './slides.module.css';
import { asset } from '../../../lib/asset';

export function AboutSlide() {
  return (
    <div className={`${styles.slide} ${styles.aboutSlide}`}>
      <div className={styles.aboutText}>
        <div className={styles.kicker}>About</div>
        <h2 className={styles.aboutTitle}>Me, in a nutshell.</h2>
        <p className={styles.aboutParagraph}>
          I&apos;ve been fascinated by technology for as long as I can remember. It started with the
          first computer my father brought home — which I promptly took apart, piece by piece.
        </p>
        <p className={styles.aboutParagraph}>
          Reassembling machines from whatever parts I could find pulled me into networking and OS
          administration. Then a friend showed me{' '}
          <span className={styles.aboutHighlight}>Macromedia Flash 4</span> — and that lit the
          spark. Websites, interactive games, and everything since.
        </p>
        <p className={styles.aboutParagraph}>
          Fifteen years on, I lead as well as build. As{' '}
          <span className={styles.aboutHighlight}>technical lead at Goalsetter</span> — and lead
          developer at MediaMonks before that — I&apos;ve guided teams of up to 12 engineers:
          setting code standards, mentoring developers, and turning business requirements into
          products that ship.
        </p>
      </div>
      <div className={styles.aboutAside}>
        <img
          src={asset('assets/image11.png')}
          alt="Mountain landscape"
          className={styles.aboutAsideImage}
        />
        <div>
          <div className={styles.asideLabel}>Beyond code</div>
          <div className={styles.asideValue}>Nature · Music · Life</div>
        </div>
      </div>
    </div>
  );
}
