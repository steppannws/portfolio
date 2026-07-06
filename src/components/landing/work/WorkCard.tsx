import type { CSSProperties, ReactNode } from 'react';
import styles from './WorkCard.module.css';

interface WorkCardProps {
  span: number;
  minHeight?: number;
  children: ReactNode;
}

export function WorkCard({ span, minHeight, children }: WorkCardProps) {
  return (
    <div
      data-reveal="1"
      data-cursor-card
      className={styles.card}
      style={
        {
          '--card-span': span,
          '--card-min-h': minHeight ? `${minHeight}px` : 'auto',
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
