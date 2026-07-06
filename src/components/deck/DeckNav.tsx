import styles from './DeckNav.module.css';

interface DeckNavProps {
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export function DeckNav({ index, count, onPrev, onNext, onGoTo }: DeckNavProps) {
  return (
    <nav className={styles.nav} aria-label="Slide navigation">
      <button
        type="button"
        className={styles.arrow}
        onClick={onPrev}
        disabled={index === 0}
        aria-label="Previous slide"
      >
        ←
      </button>
      <div className={styles.dots}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            className={i === index ? `${styles.dot} ${styles.dotActive}` : styles.dot}
            onClick={() => onGoTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </div>
      <span className={styles.counter}>
        {index + 1} / {count}
      </span>
      <button
        type="button"
        className={styles.arrow}
        onClick={onNext}
        disabled={index === count - 1}
        aria-label="Next slide"
      >
        →
      </button>
    </nav>
  );
}
