import { WorkCard } from './WorkCard';
import styles from './AceHardwareCard.module.css';
import { asset } from '../../../lib/asset';

export function AceHardwareCard() {
  return (
    <WorkCard span={7} minHeight={320}>
      <div className={styles.content}>
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
        <img src={asset('assets/image8.png')} alt="Ace Hardware Rewards" className={styles.image} />
      </div>
    </WorkCard>
  );
}
