import { WorkCard } from './WorkCard';
import type { CompactProject } from '../../../data/compactProjects';
import styles from './SimpleProjectCard.module.css';

export function SimpleProjectCard({
  span,
  minHeight,
  date,
  title,
  description,
  image,
}: CompactProject) {
  return (
    <WorkCard span={span} minHeight={minHeight}>
      <div className={styles.row}>
        <div className={styles.text}>
          <div className={styles.date}>{date}</div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
        <img src={image.src} alt={image.alt} className={styles.image} />
      </div>
    </WorkCard>
  );
}
