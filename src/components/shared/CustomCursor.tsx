import { useCursor } from '../../hooks/useCursor';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const { dotRef, ringRef } = useCursor();

  return (
    <>
      <div ref={dotRef} className={styles.ballWrap}>
        <div className={styles.ball} />
      </div>
      <div ref={ringRef} className={styles.rings}>
        <div className={styles.ringsInner}>
          <div className={styles.ringA} />
          <div className={styles.ringB} />
          <div className={styles.ringC} />
        </div>
      </div>
    </>
  );
}
