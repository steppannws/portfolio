import type { ThemeMode } from '../../hooks/useTheme';
import { ThemeToggle } from '../shared/ThemeToggle';
import styles from './Nav.module.css';

interface NavProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function Nav({ theme, onToggleTheme }: NavProps) {
  return (
    <header className={styles.header}>
      <a href="#top" className={styles.logo}>
        SN<span className={styles.logoDot}>.</span>
      </a>
      <nav className={styles.links}>
        <a href="#work" className={styles.link}>
          Work
        </a>
        <a href="#about" className={styles.link}>
          About
        </a>
        <a href="#contact" className={styles.link}>
          Contact
        </a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <span className={styles.available}>
          <span className={styles.availableDot} />
          Available
        </span>
      </nav>
    </header>
  );
}
