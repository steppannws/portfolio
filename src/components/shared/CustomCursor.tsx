import { useCursor } from '../../hooks/useCursor';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const { dotRef, ringRef } = useCursor();

  return (
    <>
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={styles.ring} />
    </>
  );
}
