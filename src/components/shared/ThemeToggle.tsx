import type { ThemeMode } from '../../hooks/useTheme';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button type="button" className={styles.button} onClick={onToggle}>
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
}
