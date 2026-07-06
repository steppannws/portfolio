import { WorkCard } from './WorkCard';
import styles from './TydeeCard.module.css';

const JOBS = [
  { name: 'Green Valley Offices', status: 'SCHEDULED', done: false },
  { name: 'Marina Bay Condos', status: 'SCHEDULED', done: false },
  { name: 'Willow Creek Spa', status: 'COMPLETED', done: true },
];

export function TydeeCard() {
  return (
    <WorkCard span={5} minHeight={320}>
      <div className={styles.header}>
        <span className={styles.date}>Startup</span>
        <span className={styles.meta}>Founder</span>
      </div>
      <h3 className={styles.title}>Tydee</h3>
      <p className={styles.description}>
        Multi-tenant platform for cleaning companies — web, admin &amp; mobile. 200+ businesses,
        10K+ jobs managed.
      </p>
      <div className={styles.window}>
        <div className={styles.windowBar}>
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
          <span className={styles.windowUrl}>app.tydee.io/dashboard</span>
        </div>
        <div className={styles.windowBody}>
          {JOBS.map((job) => (
            <div key={job.name} className={styles.jobRow}>
              <span className={job.done ? styles.jobNameDone : styles.jobName}>{job.name}</span>
              <span className={job.done ? styles.statusDone : styles.statusActive}>
                {job.status}
              </span>
            </div>
          ))}
          <div className={styles.revenueRow}>
            <span className={styles.revenueLabel}>Revenue</span>
            <span className={styles.revenueValue}>
              $24,580 <span className={styles.revenueDelta}>+18%</span>
            </span>
          </div>
        </div>
      </div>
      <div className={styles.linkRow}>
        <a href="https://www.tydee.io/" target="_blank" rel="noopener" className={styles.link}>
          tydee.io →
        </a>
      </div>
    </WorkCard>
  );
}
