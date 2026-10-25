import styles from './slides.module.css';
import { asset } from '../../../lib/asset';

const PILLS = ['AI Agents', 'Agentic Development', 'TypeScript', 'Node.js'];

export function CoverSlide() {
  return (
    <div className={`${styles.slide} ${styles.coverSlide}`}>
      <div className={styles.coverText}>
        <div className={`${styles.kicker} ${styles.coverKicker}`}>
          Technical Lead · AI &amp; Full-Stack
          <span className={styles.coverKickerRule} />
          15+ Years
        </div>
        <div>
          <h1 className={styles.coverTitle}>
            Stepan
            <br />
            Nikulenko
            <span className={styles.accentDot}>.</span>
          </h1>
          <p className={styles.coverSubtitle}>
            AI &amp; full-stack engineer and technical lead — designing AI agents and agentic
            workflows, and shipping fintech and edtech products end to end across mobile, backend
            and web.
          </p>
        </div>
        <div className={styles.pills}>
          {PILLS.map((pill) => (
            <span key={pill} className={styles.pill}>
              {pill}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.coverPortrait}>
        <img
          src={asset('assets/image6-light.webp')}
          alt="Stepan Nikulenko"
          className={styles.coverPortraitImage}
        />
        <div className={styles.coverPortraitFade} />
      </div>
    </div>
  );
}
