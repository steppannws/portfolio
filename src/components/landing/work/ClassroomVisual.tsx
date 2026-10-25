import { asset } from '../../../lib/asset';
import styles from './ClassroomVisual.module.css';

const ROWS = [
  { name: 'Canvas', note: 'LMS integration', detail: 'Deep-linked assignments' },
  { name: 'Brightspace', note: 'LMS integration', detail: 'Roster + grade sync' },
  { name: 'LTI · LTIAAS', note: 'Standard', detail: 'Launch & assessment flow' },
  { name: 'Agent tooling', note: 'Internal', detail: 'Local-LLM delivery workflows' },
];

const SHOTS = [
  { src: 'assets/classroom-hero.webp', alt: 'Goalsetter Classroom student app on laptop and phone' },
  { src: 'assets/classroom-dashboard.webp', alt: 'Goalsetter Classroom educator dashboard' },
];

export function ClassroomVisual() {
  return (
    <div>
      <div className={styles.shots}>
        {SHOTS.map((shot) => (
          <img
            key={shot.src}
            src={asset(shot.src)}
            alt={shot.alt}
            loading="lazy"
            className={styles.shot}
          />
        ))}
      </div>
      <div className={styles.sheet}>
        <div className={styles.head}>
          <span className={styles.headCell}>Integration</span>
          <span className={styles.headCell}>Scope</span>
          <span className={styles.headCell}>What it does</span>
        </div>
        {ROWS.map((row) => (
          <div key={row.name} className={styles.row}>
            <span className={styles.name}>{row.name}</span>
            <span className={styles.note}>{row.note}</span>
            <span className={styles.detail}>{row.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
