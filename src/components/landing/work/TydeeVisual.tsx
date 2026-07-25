import styles from './TydeeVisual.module.css';

const JOBS = [
  { name: 'Green Valley Offices', status: 'Scheduled', done: false },
  { name: 'Marina Bay Condos', status: 'Scheduled', done: false },
  { name: 'Willow Creek Spa', status: 'Completed', done: true },
];

export function TydeeVisual() {
  return (
    <div className={styles.window}>
      <div className={styles.bar}>
        <span className={styles.url}>app.tydee.io/dashboard</span>
        <span className={styles.barMeta}>Admin</span>
      </div>
      <div className={styles.body}>
        {JOBS.map((job) => (
          <div key={job.name} className={styles.jobRow}>
            <span className={job.done ? styles.jobNameDone : styles.jobName}>{job.name}</span>
            <span className={job.done ? styles.statusDone : styles.status}>{job.status}</span>
          </div>
        ))}
        <div className={styles.revenueRow}>
          <span className={styles.revenueLabel}>Monthly revenue</span>
          <span className={styles.revenueValue}>
            $24,580 <span className={styles.delta}>+18%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
