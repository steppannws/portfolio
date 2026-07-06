import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'sn-theme';

function getPreferredTheme(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): [ThemeMode, () => void] {
  const [theme, setTheme] = useState<ThemeMode>(getPreferredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  return [theme, toggleTheme];
}
