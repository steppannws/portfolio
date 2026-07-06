import { useParallax } from '../../hooks/useParallax';
import { GoalsetterCard } from './work/GoalsetterCard';
import { ClassroomCard } from './work/ClassroomCard';
import { TydeeCard } from './work/TydeeCard';
import { AceHardwareCard } from './work/AceHardwareCard';
import { SimpleProjectCard } from './work/SimpleProjectCard';
import { COMPACT_PROJECTS } from '../../data/compactProjects';
import styles from './WorkSection.module.css';

export function WorkSection() {
  const wordRef = useParallax<HTMLDivElement>(0.14, 'position');

  return (
    <section id="work" className={styles.section}>
      <div ref={wordRef} className={styles.word}>
        WORK
      </div>
      <div data-reveal="1" className={styles.header}>
        <div>
          <div className={styles.eyebrow}>01 — Selected Work</div>
          <h2 className={styles.title}>Work.</h2>
        </div>
        <div className={styles.meta}>2010 — 2026 · Ten projects</div>
      </div>
      <div className={styles.grid}>
        <GoalsetterCard />
        <ClassroomCard />
        <TydeeCard />
        <AceHardwareCard />
        {COMPACT_PROJECTS.map((project) => (
          <SimpleProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  );
}
