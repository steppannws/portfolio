import { describe, expect, it, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDeckController } from './useDeckController';

describe('useDeckController', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('starts at index 0 with no hash', () => {
    const { result } = renderHook(() => useDeckController(5));
    expect(result.current.index).toBe(0);
  });

  it('starts at the hash-provided index (1-based in URL)', () => {
    window.location.hash = '#3';
    const { result } = renderHook(() => useDeckController(5));
    expect(result.current.index).toBe(2);
  });

  it('next() advances and updates the hash', () => {
    const { result } = renderHook(() => useDeckController(5));
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    expect(window.location.hash).toBe('#2');
  });

  it('prev() at index 0 stays clamped at 0', () => {
    const { result } = renderHook(() => useDeckController(5));
    act(() => result.current.prev());
    expect(result.current.index).toBe(0);
  });

  it('next() at the last slide stays clamped at count - 1', () => {
    const { result } = renderHook(() => useDeckController(2));
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
  });

  it('goTo() jumps directly to a clamped index', () => {
    const { result } = renderHook(() => useDeckController(5));
    act(() => result.current.goTo(10));
    expect(result.current.index).toBe(4);
  });

  it('ArrowRight/ArrowLeft keydown navigate', () => {
    const { result } = renderHook(() => useDeckController(5));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(result.current.index).toBe(1);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(result.current.index).toBe(0);
  });
});
