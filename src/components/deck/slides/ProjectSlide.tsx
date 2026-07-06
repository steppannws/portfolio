import type { ReactNode } from 'react';
import styles from './slides.module.css';

export interface ProjectSlideProps {
  date: string;
  role: string;
  title: ReactNode;
  description: string;
  points: string[];
  tags: string[];
  media: ReactNode;
}

export function ProjectSlide({
  date,
  role,
  title,
  description,
  points,
  tags,
  media,
}: ProjectSlideProps) {
  return (
    <div className={styles.slide}>
      <div className={styles.projectText}>
        <div className={styles.projectMeta}>
          <span className={styles.projectDate}>{date}</span>
          <span className={styles.projectDot} />
          <span className={styles.projectRole}>{role}</span>
        </div>
        <h2 className={styles.projectTitle}>{title}</h2>
        <p className={styles.projectDescription}>{description}</p>
        <div className={styles.projectPoints}>
          {points.map((point, i) => (
            <div key={point} className={styles.projectPoint}>
              <span className={styles.projectPointIndex}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.projectPointText}>{point}</span>
            </div>
          ))}
        </div>
        <div className={`${styles.pills} ${styles.projectTags}`}>
          {tags.map((tag) => (
            <span key={tag} className={styles.pill}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.projectMedia}>{media}</div>
    </div>
  );
}
