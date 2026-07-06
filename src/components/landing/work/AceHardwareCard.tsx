import { WorkCard } from './WorkCard';
import styles from './AceHardwareCard.module.css';

export function AceHardwareCard() {
  return (
    <WorkCard
      span={7}
      minHeight={320}
      style={{ flexDirection: 'row', gap: 30, alignItems: 'center' }}
    >
      <div className={styles.text}>
        <div className={styles.header}>
          <span className={styles.date}>2021</span>
          <span className={styles.meta}>Retail · Lead</span>
        </div>
        <h3 className={styles.title}>Ace Hardware Rewards</h3>
        <p className={styles.description}>
          Rewards app built on the RN starter I architected — performance profiling, analytics,
          oversight.
        </p>
      </div>
      <img src="/assets/image8.png" alt="Ace Hardware Rewards" className={styles.image} />
    </WorkCard>
  );
}
