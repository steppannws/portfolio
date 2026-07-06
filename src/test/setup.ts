import '@testing-library/jest-dom/vitest';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in globalThis)) {
  // @ts-expect-error -- jsdom has no ResizeObserver; stub is enough for our tests
  globalThis.ResizeObserver = ResizeObserverStub;
}

// jsdom has no matchMedia; components call it on mount (useTheme, useCursor,
// ParticleField). Default stub: no media query matches.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
