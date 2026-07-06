# Portfolio TypeScript Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio (landing page + 13-slide deck) from proprietary `.dc.html` files into a Vite + React + TypeScript codebase that reads as an exemplary modern front-end project: strict types, KISS/DRY, plain CSS Modules with design tokens, real hook tests, Playwright smoke coverage, CI deploy to GitHub Pages.

**Architecture:** Two static Vite entry points (`index.html` landing, `deck.html` deck) sharing one `src/`. No router, no global state library — two small contexts/hooks (`useTheme`, `useDeckController`) carry all real logic. Presentational components use CSS Modules keyed off tokens in `tokens.css`. Old `.dc.html`/runtime files move to `legacy/` for reference.

**Tech Stack:** Vite, React 18, TypeScript (strict), CSS Modules, `three` (npm, not CDN), Vitest + @testing-library/react, Playwright, ESLint (typescript-eslint + react-hooks) + Prettier, GitHub Actions → GitHub Pages.

## Global Constraints

- `tsconfig.json`: `"strict": true`. No `any` anywhere (`@typescript-eslint/no-explicit-any: error`).
- Two Vite build entries: `index.html` (landing) and `deck.html` (deck). `vite.config.ts` sets `base: '/portfolio/'`.
- Design tokens live in `src/styles/tokens.css` as CSS custom properties, selected by `:root[data-theme='light']` / `:root[data-theme='dark']` on `<html>`.
- No CSS-in-JS, no Tailwind. Plain CSS via CSS Modules (`*.module.css` colocated with each component).
- Deck design canvas is fixed at 1920×1080; `Deck.tsx` scales it to fit the viewport.
- `three` is an npm dependency (`three` + `@types/three`), imported as ES modules — the old CDN `<script>` tag is dropped (unpinned third-party script was a supply-chain risk).
- Both `.pptx` files are dropped entirely (not moved to legacy) — the deck at `/deck.html` is the live source of truth now.
- Old `Landing.dc.html`, `Portfolio.dc.html`, `deck-stage.js`, `support.js` move to `legacy/` (kept for reference, not deleted).
- Images move from `assets/` to `public/assets/`; referenced with absolute paths (`/assets/foo.png`).
- CV PDF moves from `uploads/` to `public/uploads/`.
- Per the approved spec, Vitest unit coverage is scoped to the two hooks with real logic — `useTheme` and `useDeckController`. Other hooks (`useCursor`, `useParallax`, `useReveal`) are DOM/rAF/IntersectionObserver side-effect hooks with no branching logic worth unit-testing; they're covered indirectly by the Playwright smoke tests. Do not add Vitest tests for them — that would be scope creep beyond the approved spec.
- No style/snapshot tests anywhere (approved spec explicitly rules these out as brittle/low-signal).
- Every visual/content component gets one lightweight `@testing-library/react` render test asserting its key text renders — this is a content-porting guard (catches typos/broken imports when porting copy from the legacy files), not a style test. Keep these to 1–3 assertions.

## Deviation from the approved spec (found during planning)

The spec's file tree listed a generic `components/deck/Slide.tsx` wrapper for scale-to-fit. During task breakdown this turned out to be unnecessary: `Deck.tsx` already renders a single `.stage` div sized to 1920×1080 and scaled via `transform: scale()` (Task 24). Each slide component just fills that div with `width:100%;height:100%`. Adding a `Slide.tsx` wrapper around that would be an empty pass-through layer. It's dropped from the file tree; scale-to-fit logic lives in `Deck.tsx` + `useDeckController` only.

Also: the spec's `src/types/index.ts` is dropped — every type has exactly one
natural home next to its logic (`ThemeMode` in `useTheme.ts`, `DeckController`
in `useDeckController.ts`, `CompactProject` in `data/compactProjects.ts`,
`ProjectSlideProps` in `ProjectSlide.tsx`). A central types barrel would just
add an indirection layer.

---

## Part A — Project scaffold

### Task 1: Vite + TypeScript scaffold, tooling, legacy archive

**Files:**

- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `.eslintrc.cjs`, `.prettierrc.json`, `.prettierignore`, `index.html`, `deck.html`
- Create: `src/main.tsx` (stub), `src/vite-env.d.ts`
- Create: `legacy/README.md`
- Modify: `.gitignore` (add `dist/`, `node_modules/`, `playwright-report/`, `test-results/`)
- Move: `Landing.dc.html` → `legacy/Landing.dc.html`, `Portfolio.dc.html` → `legacy/Portfolio.dc.html`, `deck-stage.js` → `legacy/deck-stage.js`, `support.js` → `legacy/support.js`
- Move: `assets/*` → `public/assets/*`
- Move: `uploads/Stepan-Nikulenko-CV.pdf` → `public/uploads/Stepan-Nikulenko-CV.pdf`
- Delete: `uploads/Stepan Nikulenko - Mobile Engineer (1)-ac6a048d.pptx`, `uploads/Stepan Nikulenko - Mobile Engineer (1).pptx`, `.thumbnail`

**Interfaces:**

- Produces: a runnable `npm run dev` Vite project with two HTML entries, strict TS, lint/format/test scripts that later tasks build on.

- [ ] **Step 1: Move legacy files and assets**

```bash
mkdir -p legacy public/assets public/uploads
git mv Landing.dc.html legacy/Landing.dc.html
git mv Portfolio.dc.html legacy/Portfolio.dc.html
git mv deck-stage.js legacy/deck-stage.js
git mv support.js legacy/support.js
git mv assets/* public/assets/
git mv "uploads/Stepan-Nikulenko-CV.pdf" public/uploads/Stepan-Nikulenko-CV.pdf
git rm "uploads/Stepan Nikulenko - Mobile Engineer (1)-ac6a048d.pptx"
git rm "uploads/Stepan Nikulenko - Mobile Engineer (1).pptx"
git rm .thumbnail
rmdir uploads assets 2>/dev/null || true
```

- [ ] **Step 2: Write `legacy/README.md`**

```markdown
# Legacy files

Original `.dc.html` implementation, kept for reference while the TypeScript
rebuild (see `docs/superpowers/plans/2026-07-05-portfolio-ts-refactor.md`) is
verified equivalent. Not part of the build — safe to delete once the new
`src/` implementation is confirmed to match.
```

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "portfolio",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.160.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^15.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.160.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jsdom": "^24.0.0",
    "prettier": "^3.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vitest": "^1.5.0"
  }
}
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 6: Write `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        deck: resolve(__dirname, 'deck.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
```

- [ ] **Step 7: Write `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-hooks'],
  ignorePatterns: [
    'dist',
    'legacy',
    'playwright-report',
    'test-results',
    '*.config.ts',
    '*.config.js',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

- [ ] **Step 8: Write `.prettierrc.json` and `.prettierignore`**

`.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

`.prettierignore`:

```
dist
legacy
node_modules
playwright-report
test-results
```

- [ ] **Step 9: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stepan Nikulenko — Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Write `deck.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stepan Nikulenko — Deck</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/deck-main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 11: Write `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 12: Write stub `src/main.tsx` (replaced fully in Task 20)**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>Scaffold OK</div>
  </StrictMode>
);
```

- [ ] **Step 13: Update `.gitignore`**

Add these lines (keep existing entries):

```
dist/
node_modules/
playwright-report/
test-results/
```

- [ ] **Step 14: Install and verify dev server boots**

```bash
npm install
npm run dev -- --port 5173 &
sleep 2
curl -s http://localhost:5173/ | grep -q "Scaffold OK" && echo "OK"
kill %1
```

Expected: prints `OK`.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite+React+TS project, archive legacy files"
```

---

### Task 2: Design tokens and global CSS

**Files:**

- Create: `src/styles/tokens.css`, `src/styles/global.css`

**Interfaces:**

- Produces: `--bg`, `--ink`, `--card`, `--inner`, `--win`, `--muted`, `--meta`, `--faint`, `--sep`, `--hair`, `--hair-soft`, `--hair-strong`, `--word`, `--shadow`, `--accent-soft`, `--green`, `--green-bd`, `--band`, `--band-text`, `--nav1`, `--nav2`, `--badge` (theme-switched), plus constants `--accent`, `--font-display`, `--font-body`, `--font-mono`. Global class `.reveal-hidden` and attribute selector `[data-reveal]` (consumed by `useReveal`, Task 6). Global class `.hover-lift` (consumed by several components).

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Instrument Sans', sans-serif;
  --font-mono: 'Space Mono', monospace;
  --accent: #ff5a36;
}

:root[data-theme='light'] {
  --bg: #f1ede4;
  --ink: #141412;
  --card: #faf8f2;
  --inner: #f1ede4;
  --win: #ffffff;
  --muted: #504c42;
  --meta: #6e6a61;
  --faint: #8a8578;
  --sep: #b8b2a2;
  --hair: rgba(20, 20, 18, 0.2);
  --hair-soft: rgba(20, 20, 18, 0.16);
  --hair-strong: rgba(20, 20, 18, 0.32);
  --word: rgba(20, 20, 18, 0.05);
  --shadow: rgba(20, 20, 18, 0.12);
  --accent-soft: #d14a28;
  --green: #1f7a4d;
  --green-bd: rgba(31, 122, 77, 0.45);
  --band: #141412;
  --band-text: #d8d2c4;
  --nav1: rgba(241, 237, 228, 0.92);
  --nav2: rgba(241, 237, 228, 0);
  --badge: rgba(241, 237, 228, 0.85);
}

:root[data-theme='dark'] {
  --bg: #0a0a0c;
  --ink: #f3f1ec;
  --card: #141418;
  --inner: #0e0e11;
  --win: #1a1a1e;
  --muted: #a9a9b0;
  --meta: #9a9aa2;
  --faint: #8a8a92;
  --sep: #4a4a52;
  --hair: rgba(255, 255, 255, 0.14);
  --hair-soft: rgba(255, 255, 255, 0.09);
  --hair-strong: rgba(255, 255, 255, 0.25);
  --word: rgba(243, 241, 236, 0.05);
  --shadow: rgba(0, 0, 0, 0.45);
  --accent-soft: #ff7a5c;
  --green: #7ed9a0;
  --green-bd: rgba(126, 217, 160, 0.3);
  --band: #f1ede4;
  --band-text: #35322b;
  --nav1: rgba(10, 10, 12, 0.88);
  --nav2: rgba(10, 10, 12, 0);
  --badge: rgba(10, 10, 12, 0.6);
}
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  transition:
    background 0.4s,
    color 0.4s;
}

@media (pointer: fine) {
  * {
    cursor: none !important;
  }
}

::selection {
  background: var(--accent);
  color: var(--bg);
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(46px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes blink {
  50% {
    opacity: 0.15;
  }
}

[data-reveal] {
  transition:
    opacity 0.9s cubic-bezier(0.2, 0.7, 0.2, 1),
    transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
}

[data-reveal].reveal-hidden {
  opacity: 0;
  transform: translateY(34px);
}

.hover-lift {
  transition:
    transform 0.25s,
    box-shadow 0.25s,
    border-color 0.25s,
    background 0.4s,
    color 0.4s;
}

.hover-lift:hover {
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 var(--accent);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles
git commit -m "feat: add design token and global stylesheets"
```

---

## Part B — Hooks (the app's real logic)

### Task 3: Vitest setup file + `useTheme` hook (TDD)

**Files:**

- Create: `src/test/setup.ts`
- Create: `src/hooks/useTheme.ts`
- Test: `src/hooks/useTheme.test.tsx`

**Interfaces:**

- Produces: `ThemeMode = 'light' | 'dark'`, `useTheme(): [ThemeMode, () => void]`. Sets `data-theme` on `document.documentElement`, persists to `localStorage['sn-theme']`. Consumed by `App.tsx` (Task 20), `Nav.tsx` (Task 12), `Hero.tsx` (Task 13).

- [ ] **Step 1: Write `src/test/setup.ts`** (jsdom polyfills needed by later hook/component tests)

```ts
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
```

- [ ] **Step 2: Write failing test `src/hooks/useTheme.test.tsx`**

```tsx
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/hooks/useTheme.test.tsx`
Expected: FAIL — `Cannot find module './useTheme'`

- [ ] **Step 4: Write `src/hooks/useTheme.ts`**

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/hooks/useTheme.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/test/setup.ts src/hooks/useTheme.ts src/hooks/useTheme.test.tsx
git commit -m "feat: add useTheme hook with light/dark persistence"
```

---

### Task 4: `useDeckController` hook (TDD)

**Files:**

- Create: `src/hooks/useDeckController.ts`
- Test: `src/hooks/useDeckController.test.tsx`

**Interfaces:**

- Consumes: nothing (pure hook, takes `count: number`).
- Produces: `DeckController { index: number; scale: number; containerRef: RefObject<HTMLDivElement>; goTo(i: number): void; next(): void; prev(): void }`. Consumed by `Deck.tsx` (Task 24) and `DeckNav.tsx` (Task 23).

- [ ] **Step 1: Write failing test `src/hooks/useDeckController.test.tsx`**

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useDeckController.test.tsx`
Expected: FAIL — `Cannot find module './useDeckController'`

- [ ] **Step 3: Write `src/hooks/useDeckController.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

function parseHashIndex(count: number): number {
  const raw = window.location.hash.replace('#', '');
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(Math.max(parsed - 1, 0), count - 1);
}

export interface DeckController {
  index: number;
  scale: number;
  containerRef: React.RefObject<HTMLDivElement>;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

export function useDeckController(count: number): DeckController {
  const [index, setIndex] = useState(() => parseHashIndex(count));
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.min(Math.max(target, 0), count - 1);
      setIndex(clamped);
      window.location.hash = String(clamped + 1);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === 'PageDown' ||
        e.key === ' '
      ) {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        goTo(0);
      } else if (e.key === 'End') {
        goTo(count - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, prev, goTo, count]);

  useEffect(() => {
    const onHashChange = () => setIndex(parseHashIndex(count));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [count]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { index, scale, containerRef, goTo, next, prev };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useDeckController.test.tsx`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDeckController.ts src/hooks/useDeckController.test.tsx
git commit -m "feat: add useDeckController hook for slide nav and scale-to-fit"
```

---

### Task 5: `useParallax` and `useReveal` hooks

**Files:**

- Create: `src/hooks/useParallax.ts`, `src/hooks/useReveal.ts`

**Interfaces:**

- Produces: `useParallax<T extends HTMLElement>(factor: number, mode?: 'scroll' | 'position', fadeDistance?: number): RefObject<T>`. Consumed by `Hero.tsx` (mode `'scroll'`, fade), `WorkSection.tsx` and `AboutSection.tsx` (mode `'position'`).
- Produces: `useReveal<T extends HTMLElement>(): RefObject<T>` — attaches to a container; toggles `.reveal-hidden` on descendant `[data-reveal]` elements via IntersectionObserver. Consumed by `App.tsx` (Task 20).
- Per Global Constraints, neither hook gets a Vitest test — DOM/scroll side effects with no branching logic, covered by the landing Playwright smoke test.

- [ ] **Step 1: Write `src/hooks/useParallax.ts`**

```ts
import { useEffect, useRef } from 'react';

export type ParallaxMode = 'scroll' | 'position';

export function useParallax<T extends HTMLElement>(
  factor: number,
  mode: ParallaxMode = 'scroll',
  fadeDistance?: number
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      if (mode === 'scroll') {
        const offset = window.scrollY * factor;
        el.style.transform = `translateY(${offset}px)`;
        if (fadeDistance) {
          el.style.opacity = String(Math.max(0, 1 - window.scrollY / fadeDistance));
        }
      } else {
        const rect = el.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${centerOffset * factor}px)`;
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [factor, mode, fadeDistance]);

  return ref;
}
```

- [ ] **Step 2: Write `src/hooks/useReveal.ts`**

```ts
import { useEffect, useRef } from 'react';

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window)) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.9) {
        el.classList.add('reveal-hidden');
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-hidden');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}
```

- [ ] **Step 3: Verify project still typechecks**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useParallax.ts src/hooks/useReveal.ts
git commit -m "feat: add useParallax and useReveal scroll-effect hooks"
```

---

### Task 6: `useCursor` hook

**Files:**

- Create: `src/hooks/useCursor.ts`

**Interfaces:**

- Produces: `useCursor(): { dotRef: RefObject<HTMLDivElement>; ringRef: RefObject<HTMLDivElement> }`. No-ops (returns refs that are simply never animated) on coarse-pointer devices. Consumed by `CustomCursor.tsx` (Task 7).

- [ ] **Step 1: Write `src/hooks/useCursor.ts`**

```ts
import { useEffect, useRef } from 'react';

export function useCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    let pointerX = -100;
    let pointerY = -100;
    let ringX = -100;
    let ringY = -100;
    let ringSize = 40;
    let raf = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button')) {
        ringSize = 52;
      } else if (target.closest('[data-cursor-card]')) {
        ringSize = 64;
      } else {
        ringSize = 40;
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) return;
      dot.style.transform = `translate(${pointerX - 4}px, ${pointerY - 4}px)`;
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      ring.style.width = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.transform = `translate(${ringX - ringSize / 2}px, ${ringY - ringSize / 2}px)`;
    };

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('mouseover', onMouseOver);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return { dotRef, ringRef };
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCursor.ts
git commit -m "feat: add useCursor hook for custom cursor tracking"
```

---

## Part C — Shared components

### Task 7: `CustomCursor` component

**Files:**

- Create: `src/components/shared/CustomCursor.tsx`, `src/components/shared/CustomCursor.module.css`
- Test: `src/components/shared/CustomCursor.test.tsx`

**Interfaces:**

- Consumes: `useCursor()` from Task 6.
- Produces: `<CustomCursor />` — renders dot + ring divs, no props. Consumed by `App.tsx` (Task 20).

- [ ] **Step 1: Write `src/components/shared/CustomCursor.module.css`**

```css
.dot {
  position: fixed;
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  background: var(--accent);
  z-index: 999;
  pointer-events: none;
  transform: translate(-100px, -100px);
}

.ring {
  position: fixed;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  border: 1.5px solid rgba(255, 90, 54, 0.85);
  z-index: 998;
  pointer-events: none;
  transform: translate(-100px, -100px);
  transition:
    width 0.28s cubic-bezier(0.2, 0.7, 0.2, 1),
    height 0.28s cubic-bezier(0.2, 0.7, 0.2, 1);
}

@media (pointer: coarse) {
  .dot,
  .ring {
    display: none;
  }
}
```

- [ ] **Step 2: Write `src/components/shared/CustomCursor.tsx`**

```tsx
import { useCursor } from '../../hooks/useCursor';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const { dotRef, ringRef } = useCursor();

  return (
    <>
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={styles.ring} />
    </>
  );
}
```

- [ ] **Step 3: Write render test `src/components/shared/CustomCursor.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CustomCursor } from './CustomCursor';

describe('CustomCursor', () => {
  it('renders without crashing', () => {
    const { container } = render(<CustomCursor />);
    expect(container.querySelectorAll('div')).toHaveLength(2);
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/shared/CustomCursor.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/CustomCursor.tsx src/components/shared/CustomCursor.module.css src/components/shared/CustomCursor.test.tsx
git commit -m "feat: add CustomCursor component"
```

---

### Task 8: `ThemeToggle` component

**Files:**

- Create: `src/components/shared/ThemeToggle.tsx`, `src/components/shared/ThemeToggle.module.css`
- Test: `src/components/shared/ThemeToggle.test.tsx`

**Interfaces:**

- Consumes: `ThemeMode` type from `../../hooks/useTheme` (Task 3).
- Produces: `<ThemeToggle theme={ThemeMode} onToggle={() => void} />`. Consumed by `Nav.tsx` (Task 12).

- [ ] **Step 1: Write `src/components/shared/ThemeToggle.module.css`**

```css
.button {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--meta);
  background: transparent;
  border: 1px solid var(--hair-strong);
  padding: 8px 16px;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.button:hover {
  color: var(--ink);
  border-color: var(--ink);
}
```

- [ ] **Step 2: Write `src/components/shared/ThemeToggle.tsx`**

```tsx
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
```

- [ ] **Step 3: Write render test `src/components/shared/ThemeToggle.test.tsx`**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('shows "Dark" when in light mode and calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);
    const button = screen.getByRole('button', { name: 'Dark' });
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('shows "Light" when in dark mode', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Add `@testing-library/user-event` dependency**

```bash
npm install -D @testing-library/user-event
```

- [ ] **Step 5: Run test**

Run: `npx vitest run src/components/shared/ThemeToggle.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/ThemeToggle.tsx src/components/shared/ThemeToggle.module.css src/components/shared/ThemeToggle.test.tsx package.json package-lock.json
git commit -m "feat: add ThemeToggle component"
```

---

### Task 9: `ParticleField` component (Three.js hero background)

**Files:**

- Create: `src/components/landing/ParticleField.tsx`, `src/components/landing/ParticleField.module.css`

**Interfaces:**

- Consumes: `ThemeMode` from `useTheme`.
- Produces: `<ParticleField mouseRef={RefObject<{x,y}>} scrollRef={RefObject<number>} theme={ThemeMode} />`. Consumed lazily by `Hero.tsx` (Task 13). No Vitest test — WebGL isn't available in jsdom; covered by the landing Playwright smoke test rendering the hero without throwing.

- [ ] **Step 1: Write `src/components/landing/ParticleField.module.css`**

```css
.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.fallback {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 90, 54, 0.08) 0%, transparent 70%);
}
```

- [ ] **Step 2: Write `src/components/landing/ParticleField.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThemeMode } from '../../hooks/useTheme';
import styles from './ParticleField.module.css';

const SEPARATION = 26;
const GRID_X = 110;
const GRID_Y = 60;
const WAVE_AMPLITUDE = 22;

interface ParticleFieldProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollRef: React.RefObject<number>;
  theme: ThemeMode;
}

export function ParticleField({ mouseRef, scrollRef, theme }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextLost, setContextLost] = useState(false);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf1ede4, 0.0016);
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 3000);
    camera.position.set(0, 170, 560);

    const count = GRID_X * GRID_Y;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const accentFlags = new Uint8Array(count);

    let i = 0;
    let n = 0;
    for (let ix = 0; ix < GRID_X; ix++) {
      for (let iy = 0; iy < GRID_Y; iy++) {
        positions[i] = ix * SEPARATION - (GRID_X * SEPARATION) / 2;
        positions[i + 1] = 0;
        positions[i + 2] = iy * SEPARATION - (GRID_Y * SEPARATION) / 2;
        const isAccent = Math.random() < 0.07;
        accentFlags[n] = isAccent ? 1 : 0;
        colors[i] = isAccent ? 1.0 : 0.35;
        colors[i + 1] = isAccent ? 0.35 : 0.33;
        colors[i + 2] = isAccent ? 0.21 : 0.3;
        i += 3;
        n += 1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 2.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    let raf = 0;
    let frame = 0;

    const applyTheme = () => {
      scene.fog!.color.set(themeRef.current === 'light' ? 0xf1ede4 : 0x0a0a0c);
      const base = themeRef.current === 'light' ? [0.35, 0.33, 0.3] : [0.48, 0.48, 0.53];
      const colorArray = geometry.attributes.color.array as Float32Array;
      for (let k = 0; k < accentFlags.length; k++) {
        if (!accentFlags[k]) {
          const j = k * 3;
          colorArray[j] = base[0];
          colorArray[j + 1] = base[1];
          colorArray[j + 2] = base[2];
        }
      }
      geometry.attributes.color.needsUpdate = true;
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      applyTheme();
      const posArray = geometry.attributes.position.array as Float32Array;
      const mx = (mouseRef.current?.x ?? 0) * 620;
      const mz = (mouseRef.current?.y ?? 0) * 420 + 120;
      let k = 0;
      for (let ix = 0; ix < GRID_X; ix++) {
        for (let iy = 0; iy < GRID_Y; iy++) {
          let y =
            Math.sin((ix + frame) * 0.28) * WAVE_AMPLITUDE +
            Math.sin((iy + frame) * 0.46) * WAVE_AMPLITUDE;
          const dx = posArray[k] - mx;
          const dz = posArray[k + 2] - mz;
          const distSq = dx * dx + dz * dz;
          if (distSq < 200000) y += 110 * Math.exp(-distSq / 30000);
          posArray[k + 1] = y;
          k += 3;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      frame += 0.055;

      const targetZ = 560 + (scrollRef.current ?? 0) * 0.35;
      camera.position.x += ((mouseRef.current?.x ?? 0) * 90 - camera.position.x) * 0.04;
      camera.position.y += (170 + (mouseRef.current?.y ?? 0) * -40 - camera.position.y) * 0.04;
      camera.position.z += (targetZ - camera.position.z) * 0.06;
      camera.lookAt(0, 30, 0);
      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
      applyTheme();
      renderer.render(scene, camera);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [mouseRef, scrollRef]);

  if (contextLost) {
    return <div className={styles.fallback} />;
  }

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
```

- [ ] **Step 3: Install `three`**

```bash
npm install three
npm install -D @types/three
```

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/ParticleField.tsx src/components/landing/ParticleField.module.css package.json package-lock.json
git commit -m "feat: add ParticleField Three.js hero background"
```

---

## Part D — Landing: Nav, Hero, Marquee

### Task 10: `Nav` component

**Files:**

- Create: `src/components/landing/Nav.tsx`, `src/components/landing/Nav.module.css`
- Test: `src/components/landing/Nav.test.tsx`

**Interfaces:**

- Consumes: `ThemeMode` (Task 3), `<ThemeToggle>` (Task 8).
- Produces: `<Nav theme={ThemeMode} onToggleTheme={() => void} />`. Consumed by `App.tsx` (Task 20).

- [ ] **Step 1: Write `src/components/landing/Nav.module.css`**

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 48px;
  background: linear-gradient(180deg, var(--nav1), var(--nav2));
  backdrop-filter: blur(8px);
}

.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--ink);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.logoDot {
  color: var(--accent);
}

.links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.link {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--meta);
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: var(--ink);
}

.available {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--green);
  border: 1px solid var(--green-bd);
  padding: 8px 16px;
}

.availableDot {
  width: 7px;
  height: 7px;
  background: var(--green);
  animation: blink 2s infinite;
}
```

- [ ] **Step 2: Write `src/components/landing/Nav.tsx`**

```tsx
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
```

- [ ] **Step 3: Write render test `src/components/landing/Nav.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Nav } from './Nav';

describe('Nav', () => {
  it('renders the logo and nav links', () => {
    render(<Nav theme="light" onToggleTheme={() => {}} />);
    expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/landing/Nav.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/Nav.tsx src/components/landing/Nav.module.css src/components/landing/Nav.test.tsx
git commit -m "feat: add landing Nav component"
```

---

### Task 11: `Marquee` component

**Files:**

- Create: `src/components/landing/Marquee.tsx`, `src/components/landing/Marquee.module.css`
- Test: `src/components/landing/Marquee.test.tsx`

**Interfaces:**

- Produces: `<Marquee />`, no props. Consumed by `App.tsx` (Task 20).

- [ ] **Step 1: Write `src/components/landing/Marquee.module.css`**

```css
.band {
  overflow: hidden;
  padding: 20px 0;
  background: var(--band);
  transition: background 0.4s;
}

.track {
  display: flex;
  width: max-content;
  animation: marquee 36s linear infinite;
}

.group {
  display: flex;
  align-items: center;
  gap: 38px;
  padding-right: 38px;
  font-family: var(--font-mono);
  font-size: 15px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--band-text);
  white-space: nowrap;
}

.sep {
  color: var(--accent);
}
```

- [ ] **Step 2: Write `src/components/landing/Marquee.tsx`**

```tsx
import styles from './Marquee.module.css';

const ITEMS = [
  'React Native',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Swift · Kotlin',
  'MCP Servers',
  'Local LLM',
  'AI Workflow Engineering',
  'Agentic Automations',
  'AI-Assisted Development',
  'End-to-End Flow Optimization',
  'LTI · LMS',
  'CI/CD',
];

function MarqueeGroup() {
  return (
    <div className={styles.group}>
      {ITEMS.map((item) => (
        <span key={item}>
          {item}
          <span className={styles.sep}> ✦</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className={styles.band}>
      <div className={styles.track}>
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write render test `src/components/landing/Marquee.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Marquee } from './Marquee';

describe('Marquee', () => {
  it('renders the skill list twice for the seamless loop', () => {
    render(<Marquee />);
    expect(screen.getAllByText(/React Native/)).toHaveLength(2);
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/landing/Marquee.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/Marquee.tsx src/components/landing/Marquee.module.css src/components/landing/Marquee.test.tsx
git commit -m "feat: add landing Marquee component"
```

---

### Task 12: `Hero` component

**Files:**

- Create: `src/components/landing/Hero.tsx`, `src/components/landing/Hero.module.css`

**Interfaces:**

- Consumes: `ParticleField` (Task 9, lazy-loaded), `useParallax` (Task 5), `ThemeMode`.
- Produces: `<Hero theme={ThemeMode} />`. Consumed by `App.tsx` (Task 20). No unit test — covered by the landing Playwright smoke test (Task 22); a render test here would need to mock WebGL/`ResizeObserver`/`matchMedia` for no real value beyond what Playwright already confirms end to end.

- [ ] **Step 1: Write `src/components/landing/Hero.module.css`**

```css
.hero {
  position: relative;
  height: 100vh;
  min-height: 640px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 90, 54, 0.14) 0%, rgba(255, 90, 54, 0) 65%);
  pointer-events: none;
  left: 0;
  top: 0;
  transform: translate(-300px, -300px);
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 40px;
  pointer-events: none;
  will-change: transform, opacity;
}

.kicker {
  font-family: var(--font-mono);
  font-size: 15px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 34px;
  animation: fadeUp 0.9s 0.1s both;
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(64px, 11vw, 176px);
  line-height: 0.9;
  letter-spacing: -0.04em;
  margin: 0;
  animation: fadeUp 1s 0.25s both;
}

.titleDot {
  color: var(--accent);
}

.subtitle {
  font-size: clamp(20px, 2vw, 28px);
  color: var(--muted);
  margin: 28px 0 0;
  animation: fadeUp 1s 0.35s both;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 26px;
  margin-top: 40px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--meta);
  letter-spacing: 0.08em;
  animation: fadeUp 1s 0.45s both;
  flex-wrap: wrap;
}

.statSep {
  color: var(--sep);
}

.scrollHint {
  position: absolute;
  bottom: 34px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--faint);
  text-decoration: none;
  z-index: 2;
  transition: color 0.2s;
}

.scrollHint:hover {
  color: var(--accent);
}

.canvasFallback {
  position: absolute;
  inset: 0;
}
```

- [ ] **Step 2: Write `src/components/landing/Hero.tsx`**

```tsx
import { Suspense, lazy, useEffect, useRef } from 'react';
import type { ThemeMode } from '../../hooks/useTheme';
import { useParallax } from '../../hooks/useParallax';
import styles from './Hero.module.css';

const ParticleField = lazy(() =>
  import('./ParticleField').then((m) => ({ default: m.ParticleField }))
);

const STATS = ['React Native', 'Node.js', '15+ years', 'Buenos Aires based · Remote'];

interface HeroProps {
  theme: ThemeMode;
}

export function Hero({ theme }: HeroProps) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const glowRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useParallax<HTMLDivElement>(0.32, 'scroll', 620);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
      const glow = glowRef.current;
      if (glow) glow.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    };
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section id="top" className={styles.hero}>
      <Suspense fallback={<div className={styles.canvasFallback} />}>
        <ParticleField mouseRef={mouseRef} scrollRef={scrollRef} theme={theme} />
      </Suspense>
      <div ref={glowRef} className={styles.glow} />
      <div ref={heroContentRef} className={styles.content}>
        <div className={styles.kicker}>Hi, I&apos;m</div>
        <h1 className={styles.title}>
          Stepan
          <br />
          Nikulenko
          <span className={styles.titleDot}>.</span>
        </h1>
        <p className={styles.subtitle}>Hands-on software engineer &amp; technical leader.</p>
        <div className={styles.stats}>
          {STATS.map((stat, i) => (
            <span key={stat}>
              {i > 0 && <span className={styles.statSep}>/ </span>}
              {stat}
            </span>
          ))}
        </div>
      </div>
      <a href="#work" className={styles.scrollHint}>
        Scroll ↓
      </a>
    </section>
  );
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/Hero.tsx src/components/landing/Hero.module.css
git commit -m "feat: add landing Hero component with lazy-loaded particle field"
```

---

## Part E — Landing: Work section (8 project cards)

Note: the 8 cards split into two shapes. Four are bespoke (Goalsetter, Classroom,
Tydee, Ace Hardware — each has a differently-shaped media area). The other four
(Club Premier, Aeromexico, Guía Arqui, Humber) share one identical layout
(date → title → paragraph → single 38%-width image) and differ only in copy —
those become one data-driven `SimpleProjectCard` instead of 4 near-duplicate
files. All 8 share hover chrome via one `WorkCard` wrapper. Files live under
`src/components/landing/work/`.

### Task 13: `WorkCard` shared wrapper

**Files:**

- Create: `src/components/landing/work/WorkCard.tsx`, `src/components/landing/work/WorkCard.module.css`

**Interfaces:**

- Produces: `<WorkCard span={number} minHeight={number} style={CSSProperties}>{children}</WorkCard>`. Consumed by every card in this Part.

- [ ] **Step 1: Write `src/components/landing/work/WorkCard.module.css`**

```css
.card {
  background: var(--card);
  border: 1px solid var(--hair);
  padding: 44px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.25s,
    transform 0.25s,
    box-shadow 0.25s,
    background 0.4s;
}

.card:hover {
  border-color: var(--ink);
  transform: translate(-3px, -3px);
  box-shadow: 8px 8px 0 var(--accent);
}
```

- [ ] **Step 2: Write `src/components/landing/work/WorkCard.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react';
import styles from './WorkCard.module.css';

interface WorkCardProps {
  span: number;
  minHeight?: number;
  children: ReactNode;
  style?: CSSProperties;
}

export function WorkCard({ span, minHeight, children, style }: WorkCardProps) {
  return (
    <div
      data-reveal="1"
      data-cursor-card
      className={styles.card}
      style={{ gridColumn: `span ${span}`, minHeight, ...style }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/work/WorkCard.tsx src/components/landing/work/WorkCard.module.css
git commit -m "feat: add shared WorkCard hover-chrome wrapper"
```

---

### Task 14: `GoalsetterCard`

**Files:**

- Create: `src/components/landing/work/GoalsetterCard.tsx`, `src/components/landing/work/GoalsetterCard.module.css`

**Interfaces:**

- Consumes: `WorkCard` (Task 13).
- Produces: `<GoalsetterCard />`, no props. Consumed by `WorkSection.tsx` (Task 19).

- [ ] **Step 1: Write `src/components/landing/work/GoalsetterCard.module.css`**

```css
.header {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
}

.date {
  color: var(--accent);
}

.meta {
  color: var(--faint);
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 44px;
  letter-spacing: -0.02em;
  margin: 18px 0 12px;
}

.description {
  font-size: 18px;
  line-height: 1.55;
  color: var(--muted);
  margin: 0;
  max-width: 420px;
}

.tags {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.tag {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  border: 1px solid var(--hair-strong);
  padding: 6px 13px;
}

.media {
  position: absolute;
  right: -30px;
  bottom: -70px;
  display: flex;
  gap: 16px;
  transform: rotate(-8deg);
}

.imageTop,
.imageBottom {
  width: 190px;
  box-shadow: 12px 12px 0 var(--shadow);
}

.imageBottom {
  transform: translateY(46px);
}
```

- [ ] **Step 2: Write `src/components/landing/work/GoalsetterCard.tsx`**

```tsx
import { WorkCard } from './WorkCard';
import styles from './GoalsetterCard.module.css';

const TAGS = ['React Native', 'TypeScript', 'Technical Lead'];

export function GoalsetterCard() {
  return (
    <WorkCard span={7} minHeight={560}>
      <div className={styles.header}>
        <span className={styles.date}>2021 — 2026</span>
        <span className={styles.meta}>FinTech · Flagship</span>
      </div>
      <h3 className={styles.title}>Goalsetter</h3>
      <p className={styles.description}>
        Banking &amp; investing for the next generation. Four years on the flagship React Native app
        — from engineer to technical lead. 100K+ downloads.
      </p>
      <div className={styles.tags}>
        {TAGS.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.media}>
        <img src="/assets/gs1.png" alt="Goalsetter app" className={styles.imageTop} />
        <img src="/assets/gs3.png" alt="Goalsetter investing" className={styles.imageBottom} />
      </div>
    </WorkCard>
  );
}
```

- [ ] **Step 3: Write render test `src/components/landing/work/GoalsetterCard.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoalsetterCard } from './GoalsetterCard';

describe('GoalsetterCard', () => {
  it('renders the project title', () => {
    render(<GoalsetterCard />);
    expect(screen.getByRole('heading', { name: 'Goalsetter' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/landing/work/GoalsetterCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/work/GoalsetterCard.tsx src/components/landing/work/GoalsetterCard.module.css src/components/landing/work/GoalsetterCard.test.tsx
git commit -m "feat: add GoalsetterCard"
```

---

### Task 15: `ClassroomCard`

**Files:**

- Create: `src/components/landing/work/ClassroomCard.tsx`, `src/components/landing/work/ClassroomCard.module.css`

**Interfaces:**

- Consumes: `WorkCard` (Task 13).
- Produces: `<ClassroomCard />`. Consumed by `WorkSection.tsx` (Task 19).

- [ ] **Step 1: Write `src/components/landing/work/ClassroomCard.module.css`**

```css
.header {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
}

.date {
  color: var(--accent);
}

.meta {
  color: var(--faint);
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 38px;
  letter-spacing: -0.02em;
  margin: 18px 0 12px;
}

.description {
  font-size: 18px;
  line-height: 1.55;
  color: var(--muted);
  margin: 0 0 26px;
}

.lmsList {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: auto;
}

.lmsRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--inner);
  border: 1px solid var(--hair-soft);
  padding: 13px 18px;
}

.lmsName {
  font-family: var(--font-display);
  font-size: 18px;
}

.lmsTag {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--faint);
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.tag {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent-soft);
  border: 1px solid rgba(255, 90, 54, 0.55);
  padding: 6px 13px;
}
```

- [ ] **Step 2: Write `src/components/landing/work/ClassroomCard.tsx`**

```tsx
import { WorkCard } from './WorkCard';
import styles from './ClassroomCard.module.css';

const LMS_ROWS = [
  { name: 'Canvas', tag: 'LMS' },
  { name: 'Brightspace', tag: 'LMS' },
  { name: 'LTI · LTIAAS', tag: 'Standard' },
];

const TAGS = ['TypeScript', 'Microservices', 'PostgreSQL'];

export function ClassroomCard() {
  return (
    <WorkCard span={5} minHeight={560}>
      <div className={styles.header}>
        <span className={styles.date}>2025 — 2026</span>
        <span className={styles.meta}>EdTech · Full-Stack</span>
      </div>
      <h3 className={styles.title}>Goalsetter Classroom</h3>
      <p className={styles.description}>
        Web apps &amp; microservices bringing financial literacy into schools — plus AI agents,
        local-LLM tools and agentic workflows powering internal delivery.
      </p>
      <div className={styles.lmsList}>
        {LMS_ROWS.map((row) => (
          <div key={row.name} className={styles.lmsRow}>
            <span className={styles.lmsName}>{row.name}</span>
            <span className={styles.lmsTag}>{row.tag}</span>
          </div>
        ))}
        <div className={styles.tags}>
          {TAGS.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </WorkCard>
  );
}
```

- [ ] **Step 3: Write render test `src/components/landing/work/ClassroomCard.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClassroomCard } from './ClassroomCard';

describe('ClassroomCard', () => {
  it('renders the project title and LMS rows', () => {
    render(<ClassroomCard />);
    expect(screen.getByRole('heading', { name: 'Goalsetter Classroom' })).toBeInTheDocument();
    expect(screen.getByText('Canvas')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/landing/work/ClassroomCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/work/ClassroomCard.tsx src/components/landing/work/ClassroomCard.module.css src/components/landing/work/ClassroomCard.test.tsx
git commit -m "feat: add ClassroomCard"
```

---

### Task 16: `TydeeCard`

**Files:**

- Create: `src/components/landing/work/TydeeCard.tsx`, `src/components/landing/work/TydeeCard.module.css`

**Interfaces:**

- Consumes: `WorkCard` (Task 13).
- Produces: `<TydeeCard />`. Consumed by `WorkSection.tsx` (Task 19).

- [ ] **Step 1: Write `src/components/landing/work/TydeeCard.module.css`**

```css
.header {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
}

.date {
  color: var(--accent);
}

.meta {
  color: var(--faint);
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 38px;
  letter-spacing: -0.02em;
  margin: 18px 0 12px;
}

.description {
  font-size: 17px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}

.window {
  margin-top: 20px;
  background: var(--win);
  border: 1px solid var(--hair);
  overflow: hidden;
  transition: background 0.4s;
}

.windowBar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--hair-soft);
}

.dotRed,
.dotYellow,
.dotGreen {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dotRed {
  background: #ff5f57;
}

.dotYellow {
  background: #febc2e;
}

.dotGreen {
  background: #28c840;
}

.windowUrl {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--faint);
  margin-left: 8px;
}

.windowBody {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.jobRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.jobName {
  font-size: 14px;
  color: var(--ink);
}

.jobNameDone {
  font-size: 14px;
  color: var(--faint);
}

.statusActive {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--green);
  border: 1px solid var(--green-bd);
  padding: 3px 9px;
}

.statusDone {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--faint);
  border: 1px solid var(--hair);
  padding: 3px 9px;
}

.revenueRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--hair-soft);
  padding-top: 10px;
}

.revenueLabel {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--faint);
}

.revenueValue {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  color: var(--ink);
}

.revenueDelta {
  color: var(--green);
  font-size: 12px;
}

.linkRow {
  margin-top: auto;
  padding-top: 20px;
}

.link {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  text-decoration: none;
}
```

- [ ] **Step 2: Write `src/components/landing/work/TydeeCard.tsx`**

```tsx
import { WorkCard } from './WorkCard';
import styles from './TydeeCard.module.css';

const JOBS = [
  { name: 'Green Valley Offices', status: 'SCHEDULED', done: false },
  { name: 'Marina Bay Condos', status: 'SCHEDULED', done: false },
  { name: 'Willow Creek Spa', status: 'COMPLETED', done: true },
];

export function TydeeCard() {
  return (
    <WorkCard span={5} minHeight={320}>
      <div className={styles.header}>
        <span className={styles.date}>Startup</span>
        <span className={styles.meta}>Founder</span>
      </div>
      <h3 className={styles.title}>Tydee</h3>
      <p className={styles.description}>
        Multi-tenant platform for cleaning companies — web, admin &amp; mobile. 200+ businesses,
        10K+ jobs managed.
      </p>
      <div className={styles.window}>
        <div className={styles.windowBar}>
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
          <span className={styles.windowUrl}>app.tydee.io/dashboard</span>
        </div>
        <div className={styles.windowBody}>
          {JOBS.map((job) => (
            <div key={job.name} className={styles.jobRow}>
              <span className={job.done ? styles.jobNameDone : styles.jobName}>{job.name}</span>
              <span className={job.done ? styles.statusDone : styles.statusActive}>
                {job.status}
              </span>
            </div>
          ))}
          <div className={styles.revenueRow}>
            <span className={styles.revenueLabel}>Revenue</span>
            <span className={styles.revenueValue}>
              $24,580 <span className={styles.revenueDelta}>+18%</span>
            </span>
          </div>
        </div>
      </div>
      <div className={styles.linkRow}>
        <a href="https://www.tydee.io/" target="_blank" rel="noopener" className={styles.link}>
          tydee.io →
        </a>
      </div>
    </WorkCard>
  );
}
```

- [ ] **Step 3: Write render test `src/components/landing/work/TydeeCard.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TydeeCard } from './TydeeCard';

describe('TydeeCard', () => {
  it('renders the project title and a link to tydee.io', () => {
    render(<TydeeCard />);
    expect(screen.getByRole('heading', { name: 'Tydee' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tydee.io/ })).toHaveAttribute(
      'href',
      'https://www.tydee.io/'
    );
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/landing/work/TydeeCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/work/TydeeCard.tsx src/components/landing/work/TydeeCard.module.css src/components/landing/work/TydeeCard.test.tsx
git commit -m "feat: add TydeeCard"
```

---

### Task 17: `AceHardwareCard`

**Files:**

- Create: `src/components/landing/work/AceHardwareCard.tsx`, `src/components/landing/work/AceHardwareCard.module.css`

**Interfaces:**

- Consumes: `WorkCard` (Task 13).
- Produces: `<AceHardwareCard />`. Consumed by `WorkSection.tsx` (Task 19).

- [ ] **Step 1: Write `src/components/landing/work/AceHardwareCard.module.css`**

```css
.text {
  flex: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
}

.date {
  color: var(--accent);
}

.meta {
  color: var(--faint);
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 34px;
  letter-spacing: -0.02em;
  margin: 16px 0 10px;
}

.description {
  font-size: 17px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}

.image {
  width: 46%;
  object-fit: cover;
  border: 1px solid var(--hair);
}
```

- [ ] **Step 2: Write `src/components/landing/work/AceHardwareCard.tsx`**

```tsx
import { WorkCard } from './WorkCard';
import styles from './AceHardwareCard.module.css';

export function AceHardwareCard() {
  return (
    <WorkCard
      span={7}
      minHeight={320}
      style={{ flexDirection: 'row', gap: 30, alignItems: 'center' }}
    >
      <div className={styles.text}>
        <div className={styles.header}>
          <span className={styles.date}>2021</span>
          <span className={styles.meta}>Retail · Lead</span>
        </div>
        <h3 className={styles.title}>Ace Hardware Rewards</h3>
        <p className={styles.description}>
          Rewards app built on the RN starter I architected — performance profiling, analytics,
          oversight.
        </p>
      </div>
      <img src="/assets/image8.png" alt="Ace Hardware Rewards" className={styles.image} />
    </WorkCard>
  );
}
```

- [ ] **Step 3: Write render test `src/components/landing/work/AceHardwareCard.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AceHardwareCard } from './AceHardwareCard';

describe('AceHardwareCard', () => {
  it('renders the project title', () => {
    render(<AceHardwareCard />);
    expect(screen.getByRole('heading', { name: 'Ace Hardware Rewards' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/landing/work/AceHardwareCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/work/AceHardwareCard.tsx src/components/landing/work/AceHardwareCard.module.css src/components/landing/work/AceHardwareCard.test.tsx
git commit -m "feat: add AceHardwareCard"
```

---

### Task 18: `SimpleProjectCard` + compact projects data (Club Premier, Aeromexico, Guía Arqui, Humber)

**Files:**

- Create: `src/data/compactProjects.ts`, `src/components/landing/work/SimpleProjectCard.tsx`, `src/components/landing/work/SimpleProjectCard.module.css`

**Interfaces:**

- Consumes: `WorkCard` (Task 13).
- Produces: `CompactProject` interface, `COMPACT_PROJECTS: CompactProject[]`, `<SimpleProjectCard {...project} />`. Consumed by `WorkSection.tsx` (Task 19).

- [ ] **Step 1: Write `src/data/compactProjects.ts`**

```ts
export interface CompactProject {
  span: number;
  minHeight: number;
  date: string;
  title: string;
  description: string;
  image: { src: string; alt: string };
}

export const COMPACT_PROJECTS: CompactProject[] = [
  {
    span: 6,
    minHeight: 300,
    date: '2018 — 2021',
    title: 'Club Premier',
    description:
      "Aeromexico's loyalty platform — native SDK bridges (Lotame, SAS CI360, ThreatMetrix).",
    image: { src: '/assets/image4.png', alt: 'Club Premier' },
  },
  {
    span: 6,
    minHeight: 300,
    date: '2017 — 2018',
    title: 'Aeromexico',
    description:
      'Legacy React web migrated to a performant native app — team of 12, tight deadlines.',
    image: { src: '/assets/image7.png', alt: 'Aeromexico' },
  },
  {
    span: 6,
    minHeight: 260,
    date: '2016',
    title: 'Guía Arqui Buenos Aires',
    description: 'Architecture guide to Buenos Aires — Google Maps & custom media carousel.',
    image: { src: '/assets/image10.png', alt: 'Guía Arqui' },
  },
  {
    span: 6,
    minHeight: 260,
    date: '2016 — 2017',
    title: 'Humber',
    description:
      'Freight & merchants for truck drivers — precise GSM-network tracking via native SDK.',
    image: { src: '/assets/image9.png', alt: 'Humber' },
  },
];
```

- [ ] **Step 2: Write `src/components/landing/work/SimpleProjectCard.module.css`**

```css
.row {
  display: flex;
  gap: 24px;
  align-items: center;
  height: 100%;
}

.text {
  flex: 1.3;
}

.date {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--accent);
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.02em;
  margin: 14px 0 10px;
}

.description {
  font-size: 16px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}

.image {
  width: 38%;
  border: 1px solid var(--hair);
  object-fit: cover;
}
```

- [ ] **Step 3: Write `src/components/landing/work/SimpleProjectCard.tsx`**

```tsx
import { WorkCard } from './WorkCard';
import type { CompactProject } from '../../../data/compactProjects';
import styles from './SimpleProjectCard.module.css';

export function SimpleProjectCard({
  span,
  minHeight,
  date,
  title,
  description,
  image,
}: CompactProject) {
  return (
    <WorkCard span={span} minHeight={minHeight}>
      <div className={styles.row}>
        <div className={styles.text}>
          <div className={styles.date}>{date}</div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
        <img src={image.src} alt={image.alt} className={styles.image} />
      </div>
    </WorkCard>
  );
}
```

- [ ] **Step 4: Write render test `src/components/landing/work/SimpleProjectCard.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimpleProjectCard } from './SimpleProjectCard';
import { COMPACT_PROJECTS } from '../../../data/compactProjects';

describe('SimpleProjectCard', () => {
  it('renders each compact project title', () => {
    COMPACT_PROJECTS.forEach((project) => {
      const { unmount } = render(<SimpleProjectCard {...project} />);
      expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument();
      unmount();
    });
  });
});
```

- [ ] **Step 5: Run test**

Run: `npx vitest run src/components/landing/work/SimpleProjectCard.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/data/compactProjects.ts src/components/landing/work/SimpleProjectCard.tsx src/components/landing/work/SimpleProjectCard.module.css src/components/landing/work/SimpleProjectCard.test.tsx
git commit -m "feat: add SimpleProjectCard and compact project data"
```

---

### Task 19: `WorkSection` composition

**Files:**

- Create: `src/components/landing/WorkSection.tsx`, `src/components/landing/WorkSection.module.css`
- Test: `src/components/landing/WorkSection.test.tsx`

**Interfaces:**

- Consumes: `useParallax` (Task 5), all 4 bespoke cards + `SimpleProjectCard`/`COMPACT_PROJECTS` (Tasks 14–18).
- Produces: `<WorkSection />`. Consumed by `App.tsx` (Task 20).

- [ ] **Step 1: Write `src/components/landing/WorkSection.module.css`**

```css
.section {
  max-width: 1440px;
  margin: 0 auto;
  padding: 130px 48px 90px;
  position: relative;
}

.word {
  position: absolute;
  top: 30px;
  right: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(140px, 19vw, 290px);
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--word);
  pointer-events: none;
  user-select: none;
  will-change: transform;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 56px;
  flex-wrap: wrap;
  gap: 20px;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 20px;
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(52px, 6vw, 92px);
  line-height: 0.95;
  letter-spacing: -0.03em;
  margin: 0;
}

.meta {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--faint);
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 22px;
}
```

- [ ] **Step 2: Write `src/components/landing/WorkSection.tsx`**

```tsx
import { useParallax } from '../../hooks/useParallax';
import { GoalsetterCard } from './work/GoalsetterCard';
import { ClassroomCard } from './work/ClassroomCard';
import { TydeeCard } from './work/TydeeCard';
import { AceHardwareCard } from './work/AceHardwareCard';
import { SimpleProjectCard } from './work/SimpleProjectCard';
import { COMPACT_PROJECTS } from '../../data/compactProjects';
import styles from './WorkSection.module.css';

export function WorkSection() {
  const wordRef = useParallax<HTMLDivElement>(0.14, 'position');

  return (
    <section id="work" className={styles.section}>
      <div ref={wordRef} className={styles.word}>
        WORK
      </div>
      <div data-reveal="1" className={styles.header}>
        <div>
          <div className={styles.eyebrow}>01 — Selected Work</div>
          <h2 className={styles.title}>Work.</h2>
        </div>
        <div className={styles.meta}>2016 — 2026 · Eight projects</div>
      </div>
      <div className={styles.grid}>
        <GoalsetterCard />
        <ClassroomCard />
        <TydeeCard />
        <AceHardwareCard />
        {COMPACT_PROJECTS.map((project) => (
          <SimpleProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write render test `src/components/landing/WorkSection.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkSection } from './WorkSection';

describe('WorkSection', () => {
  it('renders all eight project cards', () => {
    render(<WorkSection />);
    const titles = [
      'Goalsetter',
      'Goalsetter Classroom',
      'Tydee',
      'Ace Hardware Rewards',
      'Club Premier',
      'Aeromexico',
      'Guía Arqui Buenos Aires',
      'Humber',
    ];
    titles.forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/landing/WorkSection.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/WorkSection.tsx src/components/landing/WorkSection.module.css src/components/landing/WorkSection.test.tsx
git commit -m "feat: compose WorkSection from all eight project cards"
```

---

## Part F — Landing: About, Contact, Footer, App composition

### Task 20: `AboutSection`, `ContactSection`, `Footer`, `App` + real `main.tsx`

**Files:**

- Create: `src/components/landing/AboutSection.tsx`, `src/components/landing/AboutSection.module.css`
- Create: `src/components/landing/ContactSection.tsx`, `src/components/landing/ContactSection.module.css`
- Create: `src/components/landing/Footer.tsx`, `src/components/landing/Footer.module.css`
- Create: `src/App.tsx`
- Modify: `src/main.tsx` (replace the Task 1 stub entirely)
- Test: `src/components/landing/AboutSection.test.tsx`, `src/components/landing/ContactSection.test.tsx`, `src/App.test.tsx`

**Interfaces:**

- Consumes: `useTheme` (Task 3), `useReveal` (Task 5), `CustomCursor` (Task 7), `Nav` (Task 10), `Marquee` (Task 11), `Hero` (Task 12), `WorkSection` (Task 19).
- Produces: `<AboutSection />`, `<ContactSection />`, `<Footer />`, `<App />` — full landing page. `main.tsx` mounts `<App>` with `styles/tokens.css` + `styles/global.css` imported.
- `App.test.tsx` mocks `./components/landing/Hero` (WebGL not available in jsdom): `vi.mock('./components/landing/Hero', () => ({ Hero: () => <section id="top" /> }))`.

- [ ] **Step 1: Write `src/components/landing/AboutSection.module.css`**

```css
.section {
  max-width: 1440px;
  margin: 0 auto;
  padding: 90px 48px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 70px;
  align-items: center;
}

@media (max-width: 900px) {
  .section {
    grid-template-columns: 1fr;
  }
}

.portrait {
  position: relative;
  will-change: transform;
}

.portraitImage {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 14% 30%;
  border: 1px solid var(--hair);
  box-shadow: 14px 14px 0 var(--shadow);
}

.badge {
  position: absolute;
  bottom: 22px;
  left: 22px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--badge);
  backdrop-filter: blur(6px);
  border: 1px solid var(--hair);
  padding: 9px 16px;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 22px;
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(40px, 4.4vw, 64px);
  line-height: 1;
  letter-spacing: -0.025em;
  margin: 0 0 28px;
}

.paragraph {
  font-size: 20px;
  line-height: 1.65;
  color: var(--muted);
  margin: 0 0 18px;
  max-width: 560px;
}

.paragraphLast {
  margin-bottom: 40px;
}

.stats {
  display: flex;
  gap: 48px;
  border-top: 1px solid var(--hair);
  padding-top: 32px;
}

.statValue {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 44px;
  color: var(--ink);
  line-height: 1;
}

.statValueAccent {
  color: var(--accent);
}

.statLabel {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--faint);
  margin-top: 6px;
}
```

- [ ] **Step 2: Write `src/components/landing/AboutSection.tsx`**

```tsx
import { useParallax } from '../../hooks/useParallax';
import styles from './AboutSection.module.css';

const STATS = [
  { value: '15+', label: 'Years' },
  { value: '20+', label: 'Engineers led' },
  { value: '∞', label: 'Products shipped — lost count', accent: true },
];

export function AboutSection() {
  const portraitRef = useParallax<HTMLDivElement>(-0.05, 'position');

  return (
    <section id="about" className={styles.section}>
      <div ref={portraitRef} data-reveal="1" className={styles.portrait}>
        <img src="/assets/image6.png" alt="Stepan Nikulenko" className={styles.portraitImage} />
        <div className={styles.badge}>Buenos Aires, AR · Remote</div>
      </div>
      <div data-reveal="1">
        <div className={styles.eyebrow}>02 — About</div>
        <h2 className={styles.title}>
          I lead as well
          <br />
          as build.
        </h2>
        <p className={styles.paragraph}>
          It started with the first computer my father brought home — which I took apart, piece by
          piece. Fifteen years later I&apos;m shipping fintech and edtech products end to end:
          native mobile apps, Node.js services, and AI-augmented internal tooling.
        </p>
        <p className={`${styles.paragraph} ${styles.paragraphLast}`}>
          As technical lead at Goalsetter and lead developer at MediaMonks, I&apos;ve guided teams
          of up to 12 engineers — code standards, mentoring, and turning requirements into products
          that ship.
        </p>
        <div className={styles.stats}>
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div
                className={
                  stat.accent ? `${styles.statValue} ${styles.statValueAccent}` : styles.statValue
                }
              >
                {stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `src/components/landing/ContactSection.module.css`**

```css
.section {
  position: relative;
  padding: 170px 48px 150px;
  text-align: center;
  overflow: hidden;
}

.glow {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
  height: 900px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 90, 54, 0.11) 0%, rgba(255, 90, 54, 0) 60%);
  pointer-events: none;
}

.content {
  position: relative;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 28px;
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(56px, 8vw, 128px);
  line-height: 0.94;
  letter-spacing: -0.035em;
  margin: 0 0 48px;
}

.titleDot {
  color: var(--accent);
}

.ctas {
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
}

.ctaPrimary {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 19px;
  color: var(--bg);
  background: var(--ink);
  padding: 18px 38px;
  text-decoration: none;
}

.ctaSecondary {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 19px;
  color: var(--ink);
  border: 1px solid var(--hair-strong);
  padding: 18px 38px;
  text-decoration: none;
}

.ctaSecondary:hover {
  border-color: var(--ink);
}

.socials {
  display: flex;
  justify-content: center;
  gap: 36px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.social {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--meta);
  text-decoration: none;
  transition: color 0.2s;
}

.social:hover {
  color: var(--accent);
}
```

- [ ] **Step 4: Write `src/components/landing/ContactSection.tsx`**

```tsx
import styles from './ContactSection.module.css';

const SOCIALS = [
  { label: 'GitHub ↗', href: 'https://github.com/steppannws' },
  { label: 'Stack Overflow ↗', href: 'https://stackoverflow.com/users/6078160/stepan-nikulenko' },
  { label: 'Behance ↗', href: 'https://www.behance.net/stepan' },
];

export function ContactSection() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.glow} />
      <div data-reveal="1" className={styles.content}>
        <div className={styles.eyebrow}>03 — Contact</div>
        <h2 className={styles.title}>
          Let&apos;s build something
          <br />
          great together
          <span className={styles.titleDot}>.</span>
        </h2>
        <div className={styles.ctas}>
          <a href="mailto:stepan.nikulenko@gmail.com" className={`${styles.ctaPrimary} hover-lift`}>
            stepan.nikulenko@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/stepann/"
            target="_blank"
            rel="noopener"
            className={`${styles.ctaSecondary} hover-lift`}
          >
            LinkedIn ↗
          </a>
        </div>
        <div className={styles.socials}>
          {SOCIALS.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener"
              className={styles.social}
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Write `src/components/landing/Footer.module.css`**

```css
.wordmarkBand {
  overflow: hidden;
  padding: 70px 0 10px;
}

.wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(64px, 11vw, 172px);
  line-height: 0.85;
  letter-spacing: -0.04em;
  text-align: center;
  white-space: nowrap;
  color: var(--word);
  user-select: none;
  pointer-events: none;
}

.footer {
  border-top: 1px solid var(--hair);
  padding: 28px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.note {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  color: var(--faint);
}

.deckLink {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  color: var(--meta);
  text-decoration: none;
  transition: color 0.2s;
}

.deckLink:hover {
  color: var(--accent);
}
```

- [ ] **Step 6: Write `src/components/landing/Footer.tsx`**

Note `import.meta.env.BASE_URL` for the deck link — plain `/deck.html` would break under the `/portfolio/` base path on Pages.

```tsx
import styles from './Footer.module.css';

export function Footer() {
  return (
    <>
      <div className={styles.wordmarkBand}>
        <div className={styles.wordmark}>STEPAN NIKULENKO</div>
      </div>
      <footer className={styles.footer}>
        <span className={styles.note}>© 2026 STEPAN NIKULENKO</span>
        <a href={`${import.meta.env.BASE_URL}deck.html`} className={styles.deckLink}>
          FULL PORTFOLIO DECK →
        </a>
        <span className={styles.note}>REMOTE — BUENOS AIRES, ARGENTINA</span>
      </footer>
    </>
  );
}
```

- [ ] **Step 7: Write `src/App.tsx`**

```tsx
import { useTheme } from './hooks/useTheme';
import { useReveal } from './hooks/useReveal';
import { CustomCursor } from './components/shared/CustomCursor';
import { Nav } from './components/landing/Nav';
import { Hero } from './components/landing/Hero';
import { Marquee } from './components/landing/Marquee';
import { WorkSection } from './components/landing/WorkSection';
import { AboutSection } from './components/landing/AboutSection';
import { ContactSection } from './components/landing/ContactSection';
import { Footer } from './components/landing/Footer';

export function App() {
  const [theme, toggleTheme] = useTheme();
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef}>
      <CustomCursor />
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <Hero theme={theme} />
      <Marquee />
      <WorkSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 8: Replace `src/main.tsx` stub**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/global.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 9: Write render tests**

`src/components/landing/AboutSection.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutSection } from './AboutSection';

describe('AboutSection', () => {
  it('renders the heading and the three stats', () => {
    render(<AboutSection />);
    expect(screen.getByRole('heading', { name: /I lead as well as build/ })).toBeInTheDocument();
    expect(screen.getByText('15+')).toBeInTheDocument();
    expect(screen.getByText('20+')).toBeInTheDocument();
  });
});
```

`src/components/landing/ContactSection.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactSection } from './ContactSection';

describe('ContactSection', () => {
  it('renders email CTA and social links', () => {
    render(<ContactSection />);
    expect(screen.getByRole('link', { name: 'stepan.nikulenko@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:stepan.nikulenko@gmail.com'
    );
    expect(screen.getByRole('link', { name: 'GitHub ↗' })).toBeInTheDocument();
  });
});
```

`src/App.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

vi.mock('./components/landing/Hero', () => ({
  Hero: () => <section id="top" />,
}));

describe('App', () => {
  it('renders all landing sections', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Work.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /I lead as well as build/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /great together/ })).toBeInTheDocument();
    expect(screen.getByText('© 2026 STEPAN NIKULENKO')).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Run the full unit suite**

Run: `npm test`
Expected: PASS — all suites (hooks + components + App).

- [ ] **Step 11: Verify the landing renders in a real browser**

```bash
npm run dev -- --port 5173 &
sleep 2
curl -s http://localhost:5173/ | grep -q 'id="root"' && echo "SERVES"
kill %1
```

Expected: `SERVES`. (Full visual check happens in Task 22's Playwright test.)

- [ ] **Step 12: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/main.tsx src/components/landing
git commit -m "feat: compose full landing page (About, Contact, Footer, App)"
```

---

## Part G — Deck

Slide inventory (13, ported from `legacy/Portfolio.dc.html`): Cover, About,
Focus, Selected-Work divider, 8 project slides (Goalsetter, Classroom, Tydee,
Ace Hardware, Club Premier, Aeromexico, Guía Arqui, Humber), Contact.
The 8 project slides share one layout — left text column (date · role, title,
description, numbered points, pill tags) + right media panel — so they become
ONE `ProjectSlide` component + a typed data file, not 8 near-identical files.
The deck is dark-only: slide styles use literal dark-palette values, not the
theme tokens (matches the original, which hardcodes its colors).

### Task 21: Deck slide components

**Files:**

- Create: `src/components/deck/slides/slides.module.css` (shared slide styles)
- Create: `src/components/deck/slides/CoverSlide.tsx`
- Create: `src/components/deck/slides/AboutSlide.tsx`
- Create: `src/components/deck/slides/FocusSlide.tsx`
- Create: `src/components/deck/slides/DividerSlide.tsx`
- Create: `src/components/deck/slides/ProjectSlide.tsx`
- Create: `src/components/deck/slides/projects.tsx` (data for the 8 project slides)
- Create: `src/components/deck/slides/ContactSlide.tsx`
- Create: `src/components/deck/slides/index.tsx` (ordered slide registry)
- Test: `src/components/deck/slides/slides.test.tsx`

**Interfaces:**

- Produces: `SLIDES: { label: string; element: ReactElement }[]` (length 13) from `slides/index.tsx`. Consumed by `Deck.tsx` (Task 24).
- Produces: `ProjectSlideData` interface in `projects.tsx`.
- Every slide root is `width:100%;height:100%` and box-sized — it fills the 1920×1080 stage that `Deck.tsx` provides.

- [ ] **Step 1: Write `src/components/deck/slides/slides.module.css`**

```css
/* ── shared slide chrome (deck is dark-only; literal colors by design) ── */

.slide {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  font-family: var(--font-body);
  background: #0f0f12;
  color: #f3f1ec;
  display: flex;
}

.kicker {
  font-family: var(--font-mono);
  font-size: 15px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--accent);
}

.pill {
  font-family: var(--font-mono);
  font-size: 13px;
  color: #c9c9cf;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  padding: 8px 15px;
}

.pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* ── cover ── */

.coverSlide {
  background: linear-gradient(105deg, #0f0f12 0%, #0f0f12 52%, #050506 72%, #000 100%);
}

.coverText {
  flex: 1;
  padding: 104px 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.coverKicker {
  display: flex;
  align-items: center;
  gap: 16px;
}

.coverKickerRule {
  width: 46px;
  height: 1px;
  background: rgba(255, 90, 54, 0.5);
  display: inline-block;
}

.coverTitle {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 132px;
  line-height: 0.92;
  letter-spacing: -0.03em;
  margin: 0;
}

.accentDot {
  color: var(--accent);
}

.coverSubtitle {
  font-size: 26px;
  line-height: 1.45;
  color: #b9b9c0;
  max-width: 560px;
  margin: 34px 0 0;
}

.coverPortrait {
  width: 44%;
  position: relative;
}

.coverPortraitImage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 22% 32%;
}

.coverPortraitFade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #000 0%, rgba(0, 0, 0, 0) 26%);
}

/* ── about ── */

.aboutSlide {
  padding: 104px 90px;
  gap: 80px;
}

.aboutText {
  flex: 1.35;
  display: flex;
  flex-direction: column;
}

.aboutTitle {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 64px;
  line-height: 1.02;
  letter-spacing: -0.02em;
  margin: 28px 0 40px;
}

.aboutParagraph {
  font-size: 23px;
  line-height: 1.6;
  color: #cfcfd5;
  margin: 0 0 22px;
  max-width: 760px;
}

.aboutHighlight {
  color: #f3f1ec;
}

.aboutAside {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
}

.aboutAsideImage {
  width: 100%;
  height: 430px;
  object-fit: cover;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.asideLabel {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6a6a72;
  margin-bottom: 14px;
}

.asideValue {
  font-family: var(--font-display);
  font-size: 30px;
  color: #f3f1ec;
}

/* ── focus ── */

.focusSlide {
  flex-direction: column;
  padding: 96px 90px;
}

.focusHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 52px;
}

.focusTitle {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 64px;
  line-height: 1;
  letter-spacing: -0.02em;
  margin: 24px 0 0;
}

.focusLede {
  font-size: 20px;
  line-height: 1.5;
  color: #9a9aa2;
  max-width: 380px;
  margin: 0;
  text-align: right;
}

.focusCards {
  display: flex;
  gap: 24px;
  margin-bottom: 42px;
}

.focusCard {
  flex: 1;
  background: #17171b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  padding: 38px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.focusCardIndex {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--accent);
}

.focusCardTitle {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 33px;
  letter-spacing: -0.01em;
}

.focusCardBody {
  font-size: 19px;
  line-height: 1.55;
  color: #a9a9b0;
  margin: 0;
}

.toolkit {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 32px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.toolkitLabel {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6a6a72;
  flex-shrink: 0;
}

/* ── divider ── */

.dividerSlide {
  background: #f1ede4;
  color: #17171b;
  flex-direction: column;
  justify-content: space-between;
  padding: 104px 90px;
}

.dividerHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dividerKicker {
  font-family: var(--font-mono);
  font-size: 15px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #b0402a;
}

.dividerMeta {
  font-family: var(--font-mono);
  font-size: 15px;
  color: #8a8578;
}

.dividerTitle {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 108px;
  line-height: 0.92;
  letter-spacing: -0.035em;
  margin: 0;
}

.workList {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(0, 0, 0, 0.14);
}

.workRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 20px;
}

.workRow:last-child {
  border-bottom: none;
}

.workName {
  font-family: var(--font-display);
  font-weight: 500;
}

.workDate {
  font-family: var(--font-mono);
  color: #8a8578;
  font-size: 15px;
}

/* ── project ── */

.projectText {
  flex: 1.08;
  padding: 88px 76px 64px 90px;
  display: flex;
  flex-direction: column;
}

.projectMeta {
  display: flex;
  align-items: center;
  gap: 18px;
}

.projectDate {
  font-family: var(--font-mono);
  font-size: 15px;
  color: var(--accent);
  letter-spacing: 0.1em;
}

.projectDot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4a4a52;
}

.projectRole {
  font-family: var(--font-mono);
  font-size: 15px;
  color: #9a9aa2;
  letter-spacing: 0.1em;
}

.projectTitle {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 70px;
  line-height: 1;
  letter-spacing: -0.025em;
  margin: 22px 0 18px;
}

.projectDescription {
  font-size: 23px;
  line-height: 1.5;
  color: #cfcfd5;
  margin: 0 0 30px;
  max-width: 620px;
}

.projectPoints {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.projectPoint {
  display: flex;
  gap: 18px;
  align-items: baseline;
}

.projectPointIndex {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent);
}

.projectPointText {
  font-size: 20px;
  color: #dddde2;
  line-height: 1.4;
}

.projectTags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: auto;
}

.projectMedia {
  width: 46%;
  flex-shrink: 0;
  background: #08080a;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 52px 40px;
}

.mediaImage {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.mediaImageThird {
  width: 30%;
  object-fit: contain;
  border-radius: 14px;
}

.raiseSlight {
  transform: translateY(-20px);
}

.dropSlight {
  transform: translateY(20px);
}

/* classroom media panel */

.lmsPanel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 0 64px;
  width: 100%;
}

.lmsPanelLabel {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6a6a72;
}

.lmsRows {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.lmsRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #141418;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 18px 24px;
}

.lmsRowName {
  font-family: var(--font-display);
  font-size: 25px;
}

.lmsRowTag {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8a8a92;
}

.lmsArrow {
  text-align: center;
  color: #4a4a52;
  font-size: 20px;
  line-height: 1;
}

.lmsTarget {
  background: rgba(255, 90, 54, 0.1);
  border: 1px solid rgba(255, 90, 54, 0.4);
  border-radius: 14px;
  padding: 18px 24px;
  text-align: center;
  font-family: var(--font-display);
  font-size: 25px;
  color: #ff7a5c;
}

.lmsDividerLine {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 6px 0;
}

/* tydee media placeholders */

.placeholderCol {
  flex: 1;
  height: 460px;
  border: 1.5px dashed rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.placeholderPhone {
  width: 150px;
  height: 460px;
  flex-shrink: 0;
  border: 1.5px dashed rgba(255, 255, 255, 0.18);
  border-radius: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.placeholderLabel {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8a8a92;
}

.placeholderHint {
  font-size: 14px;
  color: #5a5a62;
}

/* ── contact ── */

.contactSlide {
  flex-direction: column;
  justify-content: flex-end;
  padding: 96px 90px;
}

.contactBackdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}

.contactScrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 15, 18, 0.55) 0%,
    rgba(15, 15, 18, 0.72) 55%,
    rgba(10, 10, 12, 0.94) 100%
  );
}

.contactContent {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 60px;
}

.contactKicker {
  margin-bottom: 26px;
}

.contactTitle {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 104px;
  line-height: 0.94;
  letter-spacing: -0.03em;
  margin: 0;
}

.contactCard {
  flex-shrink: 0;
  min-width: 340px;
  background: rgba(20, 20, 24, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 38px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contactField {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contactFieldLabel {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8a8a92;
}

.contactFieldValue {
  font-family: var(--font-display);
  font-size: 24px;
  color: #f3f1ec;
}
```

- [ ] **Step 2: Write `src/components/deck/slides/CoverSlide.tsx`**

```tsx
import styles from './slides.module.css';

const PILLS = ['React Native', 'TypeScript', 'Node.js', 'AI-Augmented Dev'];

export function CoverSlide() {
  return (
    <div className={`${styles.slide} ${styles.coverSlide}`}>
      <div className={styles.coverText}>
        <div className={`${styles.kicker} ${styles.coverKicker}`}>
          Technical Lead · Mobile &amp; Full-Stack
          <span className={styles.coverKickerRule} />
          15+ Years
        </div>
        <div>
          <h1 className={styles.coverTitle}>
            Stepan
            <br />
            Nikulenko
            <span className={styles.accentDot}>.</span>
          </h1>
          <p className={styles.coverSubtitle}>
            React Native technical lead and full-stack engineer — shipping fintech and edtech
            products end to end, from native mobile apps to Node.js services and AI-augmented
            internal tooling.
          </p>
        </div>
        <div className={styles.pills}>
          {PILLS.map((pill) => (
            <span key={pill} className={styles.pill}>
              {pill}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.coverPortrait}>
        <img
          src="/assets/image6.png"
          alt="Stepan Nikulenko"
          className={styles.coverPortraitImage}
        />
        <div className={styles.coverPortraitFade} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/deck/slides/AboutSlide.tsx`**

```tsx
import styles from './slides.module.css';

export function AboutSlide() {
  return (
    <div className={`${styles.slide} ${styles.aboutSlide}`}>
      <div className={styles.aboutText}>
        <div className={styles.kicker}>About</div>
        <h2 className={styles.aboutTitle}>Me, in a nutshell.</h2>
        <p className={styles.aboutParagraph}>
          I&apos;ve been fascinated by technology for as long as I can remember. It started with the
          first computer my father brought home — which I promptly took apart, piece by piece.
        </p>
        <p className={styles.aboutParagraph}>
          Reassembling machines from whatever parts I could find pulled me into networking and OS
          administration. Then a friend showed me{' '}
          <span className={styles.aboutHighlight}>Macromedia Flash 4</span> — and that lit the
          spark. Websites, interactive games, and everything since.
        </p>
        <p className={styles.aboutParagraph}>
          Fifteen years on, I lead as well as build. As{' '}
          <span className={styles.aboutHighlight}>technical lead at Goalsetter</span> — and lead
          developer at MediaMonks before that — I&apos;ve guided teams of up to 12 engineers:
          setting code standards, mentoring developers, and turning business requirements into
          products that ship.
        </p>
      </div>
      <div className={styles.aboutAside}>
        <img
          src="/assets/image11.png"
          alt="Mountain landscape"
          className={styles.aboutAsideImage}
        />
        <div>
          <div className={styles.asideLabel}>Beyond code</div>
          <div className={styles.asideValue}>Nature · Music · Life</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/components/deck/slides/FocusSlide.tsx`**

```tsx
import styles from './slides.module.css';

const CARDS = [
  {
    index: '01',
    title: 'FinTech',
    body: "Banking, investing and rewards apps — Goalsetter's flagship, plus retail loyalty programs. Consumer money, done right.",
  },
  {
    index: '02',
    title: 'EdTech',
    body: 'Classroom platforms and financial-literacy tools — web apps, backend services and deep LMS integrations.',
  },
  {
    index: '03',
    title: 'Full-Stack & AI',
    body: 'Node.js services and internal tooling — including MCP servers and local-LLM agents that accelerate delivery.',
  },
];

const TOOLKIT = [
  'React Native',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'React · Vite · Redux',
  'LTI · LMS',
  'MCP · Local LLM',
  'CI/CD · Bitrise',
];

export function FocusSlide() {
  return (
    <div className={`${styles.slide} ${styles.focusSlide}`}>
      <div className={styles.focusHeader}>
        <div>
          <div className={styles.kicker}>Focus</div>
          <h2 className={styles.focusTitle}>What I build.</h2>
        </div>
        <p className={styles.focusLede}>
          From native mobile apps to full-stack services and AI tooling — three areas where I ship
          real product.
        </p>
      </div>
      <div className={styles.focusCards}>
        {CARDS.map((card) => (
          <div key={card.index} className={styles.focusCard}>
            <div className={styles.focusCardIndex}>{card.index}</div>
            <div className={styles.focusCardTitle}>{card.title}</div>
            <p className={styles.focusCardBody}>{card.body}</p>
          </div>
        ))}
      </div>
      <div className={styles.toolkit}>
        <div className={styles.toolkitLabel}>Toolkit</div>
        <div className={styles.pills}>
          {TOOLKIT.map((tool) => (
            <span key={tool} className={styles.pill}>
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write `src/components/deck/slides/DividerSlide.tsx`**

```tsx
import styles from './slides.module.css';

const WORK_LIST = [
  { name: 'Goalsetter — Invest & Bank', date: '2021 — 2026' },
  { name: 'Goalsetter Classroom', date: '2025 — 2026' },
  { name: 'Tydee', date: 'Startup · Founder' },
  { name: 'Ace Hardware Rewards', date: '2021' },
  { name: 'Club Premier', date: '2018 — 2021' },
  { name: 'Aeromexico', date: '2017 — 2018' },
  { name: 'Guía Arqui Buenos Aires', date: '2016' },
  { name: 'Humber', date: '2016 — 2017' },
];

export function DividerSlide() {
  return (
    <div className={`${styles.slide} ${styles.dividerSlide}`}>
      <div className={styles.dividerHeader}>
        <div className={styles.dividerKicker}>Selected Work</div>
        <div className={styles.dividerMeta}>2016 — 2026 · Eight projects</div>
      </div>
      <h2 className={styles.dividerTitle}>
        Selected
        <br />
        work.
      </h2>
      <div className={styles.workList}>
        {WORK_LIST.map((item) => (
          <div key={item.name} className={styles.workRow}>
            <span className={styles.workName}>{item.name}</span>
            <span className={styles.workDate}>{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Write `src/components/deck/slides/ProjectSlide.tsx`**

```tsx
import type { ReactNode } from 'react';
import styles from './slides.module.css';

export interface ProjectSlideProps {
  date: string;
  role: string;
  title: ReactNode;
  description: string;
  points: string[];
  tags: string[];
  media: ReactNode;
}

export function ProjectSlide({
  date,
  role,
  title,
  description,
  points,
  tags,
  media,
}: ProjectSlideProps) {
  return (
    <div className={styles.slide}>
      <div className={styles.projectText}>
        <div className={styles.projectMeta}>
          <span className={styles.projectDate}>{date}</span>
          <span className={styles.projectDot} />
          <span className={styles.projectRole}>{role}</span>
        </div>
        <h2 className={styles.projectTitle}>{title}</h2>
        <p className={styles.projectDescription}>{description}</p>
        <div className={styles.projectPoints}>
          {points.map((point, i) => (
            <div key={point} className={styles.projectPoint}>
              <span className={styles.projectPointIndex}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.projectPointText}>{point}</span>
            </div>
          ))}
        </div>
        <div className={`${styles.pills} ${styles.projectTags}`}>
          {tags.map((tag) => (
            <span key={tag} className={styles.pill}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.projectMedia}>{media}</div>
    </div>
  );
}
```

- [ ] **Step 7: Write `src/components/deck/slides/projects.tsx`**

```tsx
import type { ProjectSlideProps } from './ProjectSlide';
import styles from './slides.module.css';

function Placeholder({ label, phone = false }: { label: string; phone?: boolean }) {
  return (
    <div className={phone ? styles.placeholderPhone : styles.placeholderCol}>
      <span className={styles.placeholderLabel}>{label}</span>
      <span className={styles.placeholderHint}>Drop screenshot</span>
    </div>
  );
}

export const PROJECT_SLIDES: ProjectSlideProps[] = [
  {
    date: '2021 — 2026',
    role: 'Mobile Engineer → Technical Lead',
    title: 'Goalsetter',
    description:
      'The flagship React Native banking & investing app teaching the next generation to save, invest and learn — where I grew from engineer to technical lead over four years.',
    points: [
      '4+ years on the flagship fintech app — 100K+ downloads across iOS & Android',
      'Progressed Mobile Engineer → Technical Lead: set code standards, mentored, led reviews',
      'Native modules & SDK integrations in Swift/Objective-C and Kotlin/Java',
      'Integrated server-side APIs; CI/CD on Bitrise & App Center; Jest test coverage',
    ],
    tags: ['React Native', 'TypeScript', 'Redux', 'Native Modules', 'Bitrise', 'Jest'],
    media: (
      <>
        <img
          src="/assets/gs1.png"
          alt="Goalsetter dashboard"
          className={`${styles.mediaImageThird} ${styles.raiseSlight}`}
        />
        <img src="/assets/gs3.png" alt="Goalsetter investing" className={styles.mediaImageThird} />
        <img
          src="/assets/gs4.png"
          alt="Goalsetter goals"
          className={`${styles.mediaImageThird} ${styles.dropSlight}`}
        />
      </>
    ),
  },
  {
    date: '2025 — 2026',
    role: 'Full-Stack Engineer',
    title: (
      <>
        Goalsetter
        <br />
        Classroom
      </>
    ),
    description:
      "Goalsetter's new EdTech platform — web apps and backend microservices bringing financial literacy into the classroom.",
    points: [
      'Web apps & backend microservices in Node.js, TypeScript & PostgreSQL',
      'RESTful APIs architected for scalability, performance & maintainability',
      'Frontend in React, Vite, Redux & styled-components',
      'AI-augmented delivery — Claude Code & Cursor, plus MCP servers and local-LLM internal tools',
    ],
    tags: ['Node.js', 'PostgreSQL', 'React · Vite · Redux', 'REST APIs'],
    media: (
      <div className={styles.lmsPanel}>
        <div className={styles.lmsPanelLabel}>LMS Integrations</div>
        <div className={styles.lmsRows}>
          {[
            { name: 'Canvas', tag: 'LMS' },
            { name: 'Brightspace', tag: 'LMS' },
            { name: 'LTI · LTIAAS', tag: 'Standard' },
          ].map((row) => (
            <div key={row.name} className={styles.lmsRow}>
              <span className={styles.lmsRowName}>{row.name}</span>
              <span className={styles.lmsRowTag}>{row.tag}</span>
            </div>
          ))}
        </div>
        <div className={styles.lmsArrow}>↓</div>
        <div className={styles.lmsTarget}>Goalsetter Classroom</div>
        <div className={styles.lmsDividerLine} />
        <div className={styles.lmsPanelLabel}>AI-Augmented Delivery</div>
        <div className={styles.pills}>
          {['Claude Code', 'Cursor', 'MCP Servers', 'Local-LLM Tools'].map((tool) => (
            <span key={tool} className={styles.pill}>
              {tool}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    date: 'Startup',
    role: 'Founder · Full-Stack',
    title: 'Tydee',
    description:
      'My own startup — a multi-tenant platform that helps cleaning companies manage their work, employees and clients.',
    points: [
      'Multi-tenant SaaS across three surfaces — customer web, admin console & mobile app',
      'Manage jobs, scheduling, teams and client relationships in one place',
      'Designed and built end to end as founder & full-stack engineer',
    ],
    tags: ['Multi-Tenant SaaS', 'Web · Admin · Mobile', 'tydee.io'],
    media: (
      <>
        <Placeholder label="Web" />
        <Placeholder label="Admin" />
        <Placeholder label="Mobile" phone />
      </>
    ),
  },
  {
    date: '2021',
    role: 'Lead · Oversight',
    title: (
      <>
        Ace Hardware
        <br />
        Rewards
      </>
    ),
    description:
      'A rewards app built on the React Native starter I architected in 2019 — then hardened for scale and speed.',
    points: [
      'Oversaw the project end to end',
      'Performance improvements & re-render profiling',
      'Refined gradient rendering solutions',
      'Built the analytics tracking system',
    ],
    tags: ['React Native', 'Performance', 'Analytics'],
    media: (
      <img
        src="/assets/image8.png"
        alt="Ace Hardware Rewards screens"
        className={styles.mediaImage}
      />
    ),
  },
  {
    date: '2018 — 2021',
    role: 'Aeromexico Loyalty · Flagship',
    title: 'Club Premier',
    description:
      "Aeromexico's loyalty platform, with deep native SDK integration bridged cleanly into React Native.",
    points: [
      'Native SDK bridges — Lotame DMP, SAS CI360, ThreatMetrix',
      'Built an RN bridge to drive UI rendered by the native SDKs',
      'Barcode scanner auto-filling forms from Aeromexico tickets',
      'Dynamic form builder from partner requirements · Bitrise CI · Lottie',
    ],
    tags: ['React Native', 'Native Bridges', 'SAS CI360', 'Lotame', 'ThreatMetrix', 'Bitrise'],
    media: (
      <>
        <img
          src="/assets/image2.png"
          alt="Club Premier screen"
          className={`${styles.mediaImage} ${styles.raiseSlight}`}
          style={{ width: '44%' }}
        />
        <img
          src="/assets/image4.png"
          alt="Club Premier screen"
          className={`${styles.mediaImage} ${styles.dropSlight}`}
          style={{ width: '44%' }}
        />
      </>
    ),
  },
  {
    date: '2017 — 2018',
    role: 'Mobile Engineer · Team of 12',
    title: 'Aeromexico',
    description:
      'Migrating a legacy React web codebase into a performant native app — against the clock.',
    points: [
      'Ported a legacy React web UI into React Native',
      'UI animations & performance enhancement',
      'Collaborated across a 12-developer team',
      'Shipped under demanding deadlines',
    ],
    tags: ['React Native', 'Web → Native Migration', 'Animations'],
    media: (
      <img src="/assets/image7.png" alt="Aeromexico app screens" className={styles.mediaImage} />
    ),
  },
  {
    date: '2016',
    role: 'Mobile Engineer',
    title: (
      <>
        Guía Arqui
        <br />
        Buenos Aires
      </>
    ),
    description: 'An architecture guide to Buenos Aires — maps and rich media, in your pocket.',
    points: [
      'Google Maps integration for site discovery',
      'Custom image carousel for architectural media',
    ],
    tags: ['React Native', 'Google Maps'],
    media: (
      <img
        src="/assets/image10.png"
        alt="Guía Arqui Buenos Aires screens"
        className={styles.mediaImage}
      />
    ),
  },
  {
    date: '2016 — 2017',
    role: 'Mobile Engineer',
    title: 'Humber',
    description:
      'Helping truck drivers find merchants and freight between destinations — with precise, network-based tracking.',
    points: [
      'Native SDK for precise tracking over GSM network technology',
      'Google Maps for routing between destinations',
      'Trip tracking with added driver benefits',
    ],
    tags: ['React Native', 'Native SDK', 'Google Maps'],
    media: <img src="/assets/image9.png" alt="Humber app screens" className={styles.mediaImage} />,
  },
];
```

- [ ] **Step 8: Write `src/components/deck/slides/ContactSlide.tsx`**

```tsx
import styles from './slides.module.css';

const FIELDS = [
  { label: 'Email', value: 'stepan.nikulenko@gmail.com' },
  { label: 'Location', value: 'Buenos Aires, Argentina' },
  { label: 'LinkedIn', value: 'linkedin.com/in/stepann' },
];

export function ContactSlide() {
  return (
    <div className={`${styles.slide} ${styles.contactSlide}`}>
      <img src="/assets/image11.png" alt="" className={styles.contactBackdrop} />
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
```

- [ ] **Step 9: Write `src/components/deck/slides/index.tsx`**

```tsx
import type { ReactElement } from 'react';
import { CoverSlide } from './CoverSlide';
import { AboutSlide } from './AboutSlide';
import { FocusSlide } from './FocusSlide';
import { DividerSlide } from './DividerSlide';
import { ProjectSlide } from './ProjectSlide';
import { PROJECT_SLIDES } from './projects';
import { ContactSlide } from './ContactSlide';

export interface SlideEntry {
  label: string;
  element: ReactElement;
}

const PROJECT_LABELS = [
  'Goalsetter',
  'Classroom',
  'Tydee',
  'Ace Hardware',
  'Club Premier',
  'Aeromexico',
  'Guía Arqui',
  'Humber',
];

export const SLIDES: SlideEntry[] = [
  { label: 'Cover', element: <CoverSlide /> },
  { label: 'About', element: <AboutSlide /> },
  { label: 'Focus', element: <FocusSlide /> },
  { label: 'Selected Work', element: <DividerSlide /> },
  ...PROJECT_SLIDES.map((project, i) => ({
    label: PROJECT_LABELS[i],
    element: <ProjectSlide {...project} />,
  })),
  { label: 'Contact', element: <ContactSlide /> },
];
```

- [ ] **Step 10: Write `src/components/deck/slides/slides.test.tsx`**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SLIDES } from './index';

describe('deck slides', () => {
  it('has 13 slides in the expected order', () => {
    expect(SLIDES).toHaveLength(13);
    expect(SLIDES[0].label).toBe('Cover');
    expect(SLIDES[12].label).toBe('Contact');
  });

  it('every slide renders without crashing', () => {
    SLIDES.forEach((slide) => {
      const { unmount } = render(slide.element);
      unmount();
    });
  });

  it('cover slide shows the name', () => {
    render(SLIDES[0].element);
    expect(screen.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 11: Run tests**

Run: `npx vitest run src/components/deck/slides/slides.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 12: Commit**

```bash
git add src/components/deck
git commit -m "feat: add all 13 deck slide components"
```

---

### Task 22: Playwright setup + landing smoke test

**Files:**

- Create: `playwright.config.ts`, `e2e/landing.spec.ts`

**Interfaces:**

- Consumes: the full landing app (Task 20).
- Produces: `npm run test:e2e` runs against a Vite preview server. Deck spec added in Task 25 reuses this config.

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/portfolio/',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/portfolio/',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Write `e2e/landing.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('landing renders hero, sections, and toggles theme', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeVisible();
  await expect(page.locator('#work')).toBeVisible();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Light' })).toBeVisible();

  const workCards = page.locator('#work h3');
  await expect(workCards).toHaveCount(8);
});
```

- [ ] **Step 3: Install Playwright browsers**

```bash
npx playwright install chromium
```

- [ ] **Step 4: Run the e2e test**

Run: `npm run test:e2e`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/landing.spec.ts
git commit -m "test: add Playwright landing smoke test"
```

---

### Task 23: `DeckNav` component

**Files:**

- Create: `src/components/deck/DeckNav.tsx`, `src/components/deck/DeckNav.module.css`
- Test: `src/components/deck/DeckNav.test.tsx`

**Interfaces:**

- Consumes: nothing new.
- Produces: `<DeckNav index={number} count={number} onPrev={() => void} onNext={() => void} onGoTo={(i: number) => void} />`. Consumed by `Deck.tsx` (Task 24).

- [ ] **Step 1: Write `src/components/deck/DeckNav.module.css`**

```css
.nav {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 18px;
  z-index: 10;
}

.arrow {
  font-family: var(--font-mono);
  font-size: 16px;
  color: #c9c9cf;
  background: rgba(20, 20, 24, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.arrow:hover:enabled {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}

.arrow:disabled {
  opacity: 0.35;
  cursor: default;
}

.dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background 0.2s;
}

.dotActive {
  background: var(--accent);
}

.counter {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8a8a92;
  letter-spacing: 0.1em;
  min-width: 52px;
  text-align: center;
}
```

- [ ] **Step 2: Write `src/components/deck/DeckNav.tsx`**

```tsx
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
```

- [ ] **Step 3: Write test `src/components/deck/DeckNav.test.tsx`**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeckNav } from './DeckNav';

describe('DeckNav', () => {
  it('disables prev on the first slide and fires onNext', async () => {
    const onNext = vi.fn();
    render(<DeckNav index={0} count={13} onPrev={() => {}} onNext={onNext} onGoTo={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onNext).toHaveBeenCalledOnce();
    expect(screen.getByText('1 / 13')).toBeInTheDocument();
  });

  it('fires onGoTo with the dot index', async () => {
    const onGoTo = vi.fn();
    render(<DeckNav index={0} count={13} onPrev={() => {}} onNext={() => {}} onGoTo={onGoTo} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to slide 5' }));
    expect(onGoTo).toHaveBeenCalledWith(4);
  });
});
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/deck/DeckNav.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/deck/DeckNav.tsx src/components/deck/DeckNav.module.css src/components/deck/DeckNav.test.tsx
git commit -m "feat: add DeckNav slide navigation controls"
```

---

### Task 24: `Deck` composition + `deck-main.tsx` entry

**Files:**

- Create: `src/components/deck/Deck.tsx`, `src/components/deck/Deck.module.css`
- Create: `src/deck-main.tsx`
- Test: `src/components/deck/Deck.test.tsx`

**Interfaces:**

- Consumes: `useDeckController` (Task 4), `SLIDES` (Task 21), `DeckNav` (Task 23).
- Produces: `<Deck />` — renders only the active slide inside a 1920×1080 stage scaled to fit; `deck.html` entry mounts it. Deck forces `data-theme="dark"` on `<html>` (dark-only design; slide styles use literal colors, but `--accent`/font tokens come from tokens.css).

- [ ] **Step 1: Write `src/components/deck/Deck.module.css`**

```css
.viewport {
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.stage {
  width: 1920px;
  height: 1080px;
  flex-shrink: 0;
  transform-origin: center center;
  background: #0f0f12;
}
```

- [ ] **Step 2: Write `src/components/deck/Deck.tsx`**

```tsx
import { useEffect } from 'react';
import { useDeckController } from '../../hooks/useDeckController';
import { SLIDES } from './slides';
import { DeckNav } from './DeckNav';
import styles from './Deck.module.css';

export function Deck() {
  const { index, scale, containerRef, goTo, next, prev } = useDeckController(SLIDES.length);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <div ref={containerRef} className={styles.viewport}>
      <div className={styles.stage} style={{ transform: `scale(${scale})` }}>
        {SLIDES[index].element}
      </div>
      <DeckNav index={index} count={SLIDES.length} onPrev={prev} onNext={next} onGoTo={goTo} />
    </div>
  );
}
```

- [ ] **Step 3: Write `src/deck-main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import { Deck } from './components/deck/Deck';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Deck />
  </StrictMode>
);
```

Note: `global.css` is deliberately NOT imported here — its `cursor:none` and
scroll styling are landing-page concerns. The deck page brings only tokens.

- [ ] **Step 4: Write test `src/components/deck/Deck.test.tsx`**

```tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Deck } from './Deck';

describe('Deck', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('renders the cover slide first and advances with ArrowRight', () => {
    render(<Deck />);
    expect(screen.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(screen.getByRole('heading', { name: 'Me, in a nutshell.' })).toBeInTheDocument();
    expect(screen.getByText('2 / 13')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: PASS — everything.

- [ ] **Step 6: Commit**

```bash
git add src/components/deck/Deck.tsx src/components/deck/Deck.module.css src/components/deck/Deck.test.tsx src/deck-main.tsx
git commit -m "feat: add Deck page with scale-to-fit stage and keyboard nav"
```

---

### Task 25: Deck e2e smoke test

**Files:**

- Create: `e2e/deck.spec.ts`

**Interfaces:**

- Consumes: Playwright config (Task 22), deck page (Task 24).

- [ ] **Step 1: Write `e2e/deck.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('deck renders and navigates with keyboard and hash', async ({ page }) => {
  await page.goto('./deck.html');

  await expect(page.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeVisible();
  await expect(page.getByText('1 / 13')).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('2 / 13')).toBeVisible();
  expect(page.url()).toContain('#2');

  await page.goto('./deck.html#13');
  await expect(page.getByText('13 / 13')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Let's build/ })).toBeVisible();
});
```

- [ ] **Step 2: Run e2e suite**

Run: `npm run test:e2e`
Expected: 2 passed (landing + deck).

- [ ] **Step 3: Commit**

```bash
git add e2e/deck.spec.ts
git commit -m "test: add deck e2e smoke test"
```

---

## Part H — CI, README, final sweep

### Task 26: GitHub Actions deploy workflow

**Files:**

- Create: `.github/workflows/deploy.yml`

**Interfaces:**

- Consumes: `npm run build` (Task 1 scripts), unit tests, lint.
- Produces: on push to `main`: lint + test + build + deploy `dist/` to GitHub Pages.

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Note: e2e is intentionally NOT in the deploy workflow (needs browser install,
slows the deploy loop; run locally before pushing). If desired later, add a
separate `e2e.yml` on pull_request.

- [ ] **Step 2: Enable Pages via gh (one-time)**

```bash
gh api repos/steppannws/portfolio/pages -X POST -f build_type=workflow 2>/dev/null || echo "Pages may already be enabled or needs repo visibility change"
```

Note: GitHub Pages on a private repo requires a paid plan. If the API call
fails for that reason, either make the repo public
(`gh repo edit steppannws/portfolio --visibility public --accept-visibility-change-consequences`)
— ask the user first — or skip deploy until they decide.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

---

### Task 27: README rewrite + full verification sweep

**Files:**

- Modify: `README.md` (full rewrite)

**Interfaces:**

- Consumes: everything.
- Produces: final verified project.

- [ ] **Step 1: Rewrite `README.md`**

````markdown
# Stepan Nikulenko — Portfolio

Personal portfolio: an interactive landing page and a 13-slide presentation
deck. Vite + React + TypeScript, plain CSS Modules over design tokens, tested
with Vitest and Playwright, deployed to GitHub Pages via Actions.

**Live:** https://steppannws.github.io/portfolio/

## Pages

| Entry                      | What it is                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `index.html` → `/`         | Landing — Three.js particle hero, custom cursor, parallax, light/dark theme                        |
| `deck.html` → `/deck.html` | 13-slide deck — keyboard nav (arrows/Home/End), hash-linkable slides, scale-to-fit 1920×1080 stage |

## Development

```bash
npm install
npm run dev        # dev server
npm test           # unit tests (Vitest)
npm run test:e2e   # smoke tests (Playwright; needs `npx playwright install chromium` once)
npm run lint       # ESLint
npm run build      # production build → dist/
```

## Architecture notes

- **Two static entries, no router** — the landing and the deck are separate
  Vite HTML entries; there's no SPA navigation between them.
- **Design tokens** (`src/styles/tokens.css`) — all colors are CSS custom
  properties switched by `data-theme` on `<html>`; components never hardcode
  theme colors. The deck is dark-only by design and uses its own literal
  palette.
- **Logic lives in hooks** (`src/hooks/`) — `useTheme` (persistence +
  OS-preference default) and `useDeckController` (slide index, keyboard nav,
  hash sync, scale-to-fit) are the only stateful logic, and both are
  unit-tested. Components stay presentational.
- **8 landing project cards** — 4 bespoke + 4 data-driven via one
  `SimpleProjectCard`. **8 deck project slides** — all data-driven via one
  `ProjectSlide`.
- **Three.js is an npm dep**, lazy-loaded so it doesn't block first paint;
  WebGL context loss falls back to a static gradient; `prefers-reduced-motion`
  renders a single static frame.

## Author

**Stepan Nikulenko** — Technical Lead · Mobile & Full-Stack Engineer
Buenos Aires, Argentina · Remote

- Email: stepan.nikulenko@gmail.com
- LinkedIn: [in/stepann](https://www.linkedin.com/in/stepann/)
- GitHub: [@steppannws](https://github.com/steppannws)
- Stack Overflow: [stepan-nikulenko](https://stackoverflow.com/users/6078160/stepan-nikulenko)
- Behance: [stepan](https://www.behance.net/stepan)
````

- [ ] **Step 2: Full verification sweep**

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Expected: all green. If lint flags formatting, run `npm run format` first.

- [ ] **Step 3: Visual spot-check against legacy**

Serve `npm run preview`, open `http://localhost:4173/portfolio/` and
`http://localhost:4173/portfolio/deck.html` in a browser. Compare against
`legacy/Landing.dc.html` / `legacy/Portfolio.dc.html` served statically.
Check: hero particles react to mouse; theme toggle flips everything; all 8
work cards present with hover lift; deck arrows/dots/keyboard work; slide 13
shows contact card.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for the TypeScript rebuild"
```

---

## Task summary

| #     | Task                        | Deliverable                                      |
| ----- | --------------------------- | ------------------------------------------------ |
| 1     | Scaffold + legacy archive   | Runnable Vite+TS project, old files in `legacy/` |
| 2     | Tokens + global CSS         | Theme-switched design tokens                     |
| 3     | `useTheme` (TDD)            | Tested theme hook                                |
| 4     | `useDeckController` (TDD)   | Tested deck nav/scale hook                       |
| 5     | `useParallax` + `useReveal` | Scroll-effect hooks                              |
| 6     | `useCursor`                 | Cursor-tracking hook                             |
| 7     | `CustomCursor`              | Cursor dot + ring                                |
| 8     | `ThemeToggle`               | Theme button                                     |
| 9     | `ParticleField`             | Three.js hero background                         |
| 10    | `Nav`                       | Landing header                                   |
| 11    | `Marquee`                   | Skills band                                      |
| 12    | `Hero`                      | Hero with lazy particles                         |
| 13    | `WorkCard`                  | Shared card chrome                               |
| 14–17 | Bespoke cards               | Goalsetter, Classroom, Tydee, Ace                |
| 18    | `SimpleProjectCard` + data  | 4 compact cards, data-driven                     |
| 19    | `WorkSection`               | Full work grid                                   |
| 20    | About/Contact/Footer/App    | Complete landing                                 |
| 21    | Deck slides                 | All 13 slides (8 data-driven)                    |
| 22    | Playwright + landing e2e    | Smoke coverage                                   |
| 23    | `DeckNav`                   | Slide controls                                   |
| 24    | `Deck` + entry              | Complete deck page                               |
| 25    | Deck e2e                    | Smoke coverage                                   |
| 26    | Deploy workflow             | CI → GitHub Pages                                |
| 27    | README + sweep              | Verified final state                             |
