import { asset } from '../../../lib/asset';
import styles from './TydeeVisual.module.css';

const SHOTS = [
  { src: 'assets/tydee-app-01-hero.png', alt: 'Tydee app overview' },
  { src: 'assets/tydee-app-03-jobs-map.png', alt: 'Tydee jobs map' },
  { src: 'assets/tydee-app-05-revenue.png', alt: 'Tydee revenue' },
];

export function TydeeVisual() {
  return (
    <div className={styles.row}>
      {SHOTS.map((shot) => (
        <img
          key={shot.src}
          src={asset(shot.src)}
          alt={shot.alt}
          loading="lazy"
          className={styles.shot}
        />
      ))}
    </div>
  );
}
