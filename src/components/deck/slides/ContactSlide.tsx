import styles from './slides.module.css';
import { asset } from '../../../lib/asset';

const FIELDS = [
  { label: 'Email', value: 'stepan.nikulenko@gmail.com' },
  { label: 'Location', value: 'Buenos Aires, Argentina' },
  { label: 'LinkedIn', value: 'linkedin.com/in/stepann' },
];

export function ContactSlide() {
  return (
    <div className={`${styles.slide} ${styles.contactSlide}`}>
      <img src={asset('assets/image11.webp')} alt="" className={styles.contactBackdrop} />
      <div className={styles.contactScrim} />
      <div className={styles.contactContent}>
        <div>
          <div className={`${styles.kicker} ${styles.contactKicker}`}>Let&apos;s connect</div>
          <h2 className={styles.contactTitle}>
            Let&apos;s build
            <br />
            something.
          </h2>
        </div>
        <div className={styles.contactCard}>
          {FIELDS.map((field) => (
            <div key={field.label} className={styles.contactField}>
              <span className={styles.contactFieldLabel}>{field.label}</span>
              <span className={styles.contactFieldValue}>{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
