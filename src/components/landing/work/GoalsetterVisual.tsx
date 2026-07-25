import { asset } from '../../../lib/asset';
import styles from './GoalsetterVisual.module.css';

const SHOTS = [
  { src: 'assets/gs1.png', alt: 'Goalsetter onboarding' },
  { src: 'assets/gs3.png', alt: 'Goalsetter investing' },
  { src: 'assets/gs5.png', alt: 'Goalsetter quiz' },
];

export function GoalsetterVisual() {
  return (
    <div className={styles.row}>
      {SHOTS.map((shot) => (
        <img key={shot.src} src={asset(shot.src)} alt={shot.alt} className={styles.shot} />
      ))}
    </div>
  );
}
