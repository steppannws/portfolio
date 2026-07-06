import type { CSSProperties, ReactNode } from 'react';
import styles from './WorkCard.module.css';

interface WorkCardProps {
  span: number;
  minHeight?: number;
  children: ReactNode;
  style?: CSSProperties;
}

export function WorkCard({ span, minHeight, children, style }: WorkCardProps) {
  return (
    <div
      data-reveal="1"
      data-cursor-card
      className={styles.card}
      style={{ gridColumn: `span ${span}`, minHeight, ...style }}
    >
      {children}
    </div>
  );
}
