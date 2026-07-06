import { useParallax } from '../../hooks/useParallax';
import styles from './AboutSection.module.css';
import { asset } from '../../lib/asset';

const STATS = [
  { value: '15+', label: 'Years' },
  { value: '20+', label: 'Engineers led' },
  { value: '∞', label: 'Products shipped — lost count', accent: true },
];

export function AboutSection() {
  const portraitRef = useParallax<HTMLDivElement>(-0.05, 'position');

  return (
    <section id="about" className={styles.section}>
      <div ref={portraitRef} data-reveal="1" className={styles.portrait}>
        <img
          src={asset('assets/image6.png')}
          alt="Stepan Nikulenko"
          className={styles.portraitImage}
        />
        <div className={styles.badge}>Buenos Aires, AR · Remote</div>
      </div>
      <div data-reveal="1">
        <div className={styles.eyebrow}>02 — About</div>
        <h2 className={styles.title}>
          Hands-on,
          <br />
          from code to team.
        </h2>
        <p className={styles.paragraph}>
          It started with the first computer my father brought home — which I took apart, piece by
          piece. Fifteen years later I&apos;m shipping fintech and edtech products end to end:
          native mobile apps, Node.js services, and AI-augmented internal tooling.
        </p>
        <p className={`${styles.paragraph} ${styles.paragraphLast}`}>
          As technical lead at Goalsetter and lead developer at MediaMonks, I&apos;ve guided teams
          of up to 12 engineers — code standards, mentoring, and turning requirements into products
          that ship.
        </p>
        <div className={styles.stats}>
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div
                className={
                  stat.accent ? `${styles.statValue} ${styles.statValueAccent}` : styles.statValue
                }
              >
                {stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
