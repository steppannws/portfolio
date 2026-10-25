import styles from './slides.module.css';
import { asset } from '../../../lib/asset';

const SHOTS = [
  { file: '01-hero', alt: 'Tydee app overview' },
  { file: '02-calendar', alt: 'Tydee calendar' },
  { file: '03-jobs-map', alt: 'Tydee jobs map' },
  { file: '04-clock-in', alt: 'Tydee clock-in' },
  { file: '05-revenue', alt: 'Tydee revenue' },
  { file: '06-messages', alt: 'Tydee messages' },
];

export function TydeeMobileSlide() {
  return (
    <div className={`${styles.slide} ${styles.gallerySlide}`}>
      <div className={styles.focusHeader}>
        <div>
          <div className={styles.kicker}>Tydee · Mobile App</div>
          <h2 className={styles.focusTitle}>The business, in your pocket.</h2>
        </div>
        <p className={styles.focusLede}>
          iOS & Android app for owners, crews and clients — built with Expo & React Native.
        </p>
      </div>
      <div className={styles.galleryRow}>
        {SHOTS.map((shot) => (
          <img
            key={shot.file}
            src={asset(`assets/tydee-app-${shot.file}.webp`)}
            alt={shot.alt}
            className={styles.galleryImage}
          />
        ))}
      </div>
    </div>
  );
}
