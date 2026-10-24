import { COMPACT_PROJECTS } from '../../../data/compactProjects';
import styles from './WorkIndex.module.css';

/** Archive rows — one line per project, thumbnail on hover. */
export function WorkIndex() {
  return (
    <div className={styles.list}>
      <div className={styles.head} aria-hidden="true">
        <span>№</span>
        <span>Project</span>
        <span>What it was</span>
        <span>Year</span>
      </div>
      {COMPACT_PROJECTS.map((project, i) => (
        <div key={project.title} data-reveal="1" className={styles.row}>
          <span className={styles.num}>{String(i + 5).padStart(2, '0')}</span>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.note}>{project.description}</p>
          <span className={styles.year}>{project.date}</span>
          <img
            src={project.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={styles.thumb}
          />
        </div>
      ))}
    </div>
  );
}
