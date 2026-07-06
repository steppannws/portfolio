import styles from './slides.module.css';

const PILLS = ['React Native', 'TypeScript', 'Node.js', 'AI-Augmented Dev'];

export function CoverSlide() {
  return (
    <div className={`${styles.slide} ${styles.coverSlide}`}>
      <div className={styles.coverText}>
        <div className={`${styles.kicker} ${styles.coverKicker}`}>
          Technical Lead · Mobile &amp; Full-Stack
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
            React Native technical lead and full-stack engineer — shipping fintech and edtech
            products end to end, from native mobile apps to Node.js services and AI-augmented
            internal tooling.
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
          src="/assets/image6.png"
          alt="Stepan Nikulenko"
          className={styles.coverPortraitImage}
        />
        <div className={styles.coverPortraitFade} />
      </div>
    </div>
  );
}
