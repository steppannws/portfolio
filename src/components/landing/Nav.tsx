import type { ThemeMode } from '../../hooks/useTheme';
import { ThemeToggle } from '../shared/ThemeToggle';
import styles from './Nav.module.css';

const LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

interface NavProps {
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export function Nav({ theme, onToggleTheme }: NavProps) {
  return (
    <header className={styles.header}>
      <div className={`shell ${styles.inner}`}>
        <a href="#top" className={styles.logo}>
          Stepan Nikulenko
        </a>
        <nav className={styles.links}>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
          {theme && onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
        </nav>
      </div>
    </header>
  );
}
