import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.stubGlobal(
      'matchMedia',
      vi
        .fn()
        .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    );
  });

  it('defaults to light when no stored preference and no dark OS preference', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('reads a stored preference over the OS default', () => {
    localStorage.setItem('sn-theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('dark');
  });

  it('toggles and persists the new value', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current[1]());
    expect(result.current[0]).toBe('dark');
    expect(localStorage.getItem('sn-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
