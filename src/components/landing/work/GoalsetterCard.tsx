import { WorkCard } from './WorkCard';
import styles from './GoalsetterCard.module.css';
import { asset } from '../../../lib/asset';

const TAGS = ['React Native', 'TypeScript', 'Technical Lead'];

export function GoalsetterCard() {
  return (
    <WorkCard span={7} minHeight={560}>
      <div className={styles.header}>
        <span className={styles.date}>2021 — 2026</span>
        <span className={styles.meta}>FinTech · Flagship</span>
      </div>
      <h3 className={styles.title}>Goalsetter</h3>
      <p className={styles.description}>
        Banking &amp; investing for the next generation. Four years on the flagship React Native app
        — from engineer to technical lead. 100K+ downloads.
      </p>
      <div className={styles.tags}>
        {TAGS.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.media}>
        <img src={asset('assets/gs1.png')} alt="Goalsetter app" className={styles.imageTop} />
        <img
          src={asset('assets/gs3.png')}
          alt="Goalsetter investing"
          className={styles.imageBottom}
        />
      </div>
    </WorkCard>
  );
}
