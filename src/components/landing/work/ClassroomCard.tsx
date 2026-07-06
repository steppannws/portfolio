import { WorkCard } from './WorkCard';
import styles from './ClassroomCard.module.css';

const LMS_ROWS = [
  { name: 'Canvas', tag: 'LMS' },
  { name: 'Brightspace', tag: 'LMS' },
  { name: 'LTI · LTIAAS', tag: 'Standard' },
];

const TAGS = ['TypeScript', 'Microservices', 'PostgreSQL'];

export function ClassroomCard() {
  return (
    <WorkCard span={5} minHeight={560}>
      <div className={styles.header}>
        <span className={styles.date}>2025 — 2026</span>
        <span className={styles.meta}>EdTech · Full-Stack</span>
      </div>
      <h3 className={styles.title}>Goalsetter Classroom</h3>
      <p className={styles.description}>
        Web apps &amp; microservices bringing financial literacy into schools — plus AI agents,
        local-LLM tools and agentic workflows powering internal delivery.
      </p>
      <div className={styles.lmsList}>
        {LMS_ROWS.map((row) => (
          <div key={row.name} className={styles.lmsRow}>
            <span className={styles.lmsName}>{row.name}</span>
            <span className={styles.lmsTag}>{row.tag}</span>
          </div>
        ))}
        <div className={styles.tags}>
          {TAGS.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </WorkCard>
  );
}
