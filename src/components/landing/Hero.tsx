import { asset } from '../../lib/asset';
import styles from './Hero.module.css';

const META = [
  { label: 'Role', value: 'Technical Lead' },
  { label: 'Focus', value: 'React Native · Node.js · AI tooling' },
  { label: 'Based', value: 'Buenos Aires, AR — Remote' },
  { label: 'Status', value: 'Open to work', live: true },
];

export function Hero() {
  return (
    <section id="top" data-surface="paper" className={styles.hero}>
      <div className={`shell ${styles.inner}`}>
        <div className={styles.type}>
          <h1 className={`display ${styles.name}`}>
            <span className={styles.nameBack}>Stepan</span>{' '}
            <span className={styles.nameFront}>Nikulenko</span>
          </h1>
          <p className={styles.role}>
            Mobile <span className="serif">&amp;</span> full-stack engineer, fifteen years
            hands-on&nbsp;— shipping fintech and edtech products end to end.
          </p>
        </div>
        <div className={styles.portrait}>
          <img
            src={asset('assets/image6-light.png')}
            alt="Stepan Nikulenko"
            className={styles.portraitImage}
          />
        </div>
      </div>
      <div className={`shell ${styles.metaStrip}`}>
        {META.map((item) => (
          <div key={item.label} className={styles.metaCell}>
            <span className={styles.metaLabel}>{item.label}</span>
            <span className={styles.metaValue}>
              {item.live && <span className={styles.live} />}
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
