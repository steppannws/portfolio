import styles from './slides.module.css';

const WORK_LIST = [
  { name: 'Goalsetter — Invest & Bank', date: '2021 — 2026' },
  { name: 'Goalsetter Classroom', date: '2025 — 2026' },
  { name: 'Tydee', date: 'Startup · Founder' },
  { name: 'Ace Hardware Rewards', date: '2021' },
  { name: 'Club Premier', date: '2018 — 2021' },
  { name: 'Aeromexico', date: '2017 — 2018' },
  { name: 'Guía Arqui Buenos Aires', date: '2016' },
  { name: 'Humber', date: '2016 — 2017' },
  { name: 'Carrera Aérea · Disney', date: '2013' },
  { name: 'Personal Taxi Dakar', date: '2010' },
];

export function DividerSlide() {
  return (
    <div className={`${styles.slide} ${styles.dividerSlide}`}>
      <div className={styles.dividerHeader}>
        <div className={styles.dividerKicker}>Selected Work</div>
        <div className={styles.dividerMeta}>2010 — 2026 · Ten projects</div>
      </div>
      <h2 className={styles.dividerTitle}>
        Selected
        <br />
        work.
      </h2>
      <div className={styles.workList}>
        {WORK_LIST.map((item) => (
          <div key={item.name} className={styles.workRow}>
            <span className={styles.workName}>{item.name}</span>
            <span className={styles.workDate}>{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
