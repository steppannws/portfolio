import type { ReactNode } from 'react';
import styles from './FlagshipProject.module.css';

export interface FlagshipProjectProps {
  index: string;
  years: string;
  kind: string;
  title: string;
  blurb: string;
  tags: string[];
  link?: { label: string; href: string };
  /** put the visual on the left instead of the right */
  flip?: boolean;
  /** imagery bleeds off the page edge; text-based visuals stay inside the grid */
  bleed?: boolean;
  children: ReactNode;
}

export function FlagshipProject({
  index,
  years,
  kind,
  title,
  blurb,
  tags,
  link,
  flip,
  bleed = true,
  children,
}: FlagshipProjectProps) {
  const classes = [styles.block, flip && styles.flip, !bleed && styles.noBleed]
    .filter(Boolean)
    .join(' ');

  return (
    <article data-reveal="1" className={classes}>
      <div className={styles.text}>
        <span className={styles.index} aria-hidden="true">
          {index}
        </span>
        <div className={styles.meta}>
          <span>{years}</span>
          <span>{kind}</span>
        </div>
        <h3 className={`display ${styles.title}`}>{title}</h3>
        <p className={styles.blurb}>{blurb}</p>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>
        {link && (
          <a href={link.href} target="_blank" rel="noopener" className={styles.link}>
            {link.label}
          </a>
        )}
      </div>
      <div className={styles.visual}>{children}</div>
    </article>
  );
}
