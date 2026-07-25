import { asset } from '../../../lib/asset';
import styles from './AceVisual.module.css';

export function AceVisual() {
  return (
    <img
      src={asset('assets/image8.png')}
      alt="Ace Hardware Rewards app screens"
      className={styles.image}
    />
  );
}
