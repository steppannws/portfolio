# Portfolio TypeScript Refactor — Design

Date: 2026-07-05

## Goal

Rebuild the portfolio (landing page + 13-slide deck) from proprietary `.dc.html` /
inline-style format into a small, exemplary TypeScript + React + Vite codebase.
Optimized to read as a good example of modern front-end practice: KISS, DRY,
strict typing, minimal dependencies, real tests, CI deploy.

## Non-goals

- No CMS, no server, no SSR — static site, client-rendered.
- No redesign of visual content — same hero, marquee, sections, 13 slides,
  same copy/imagery. This is a re-implementation, not a redesign.
- No router library — only two static pages, not an SPA.

## Stack

- **Vite + React + TypeScript** (`strict: true`, no `any`)
- **Plain CSS** with design tokens as CSS custom properties (`tokens.css`),
  keyed off `data-theme` attribute — no CSS-in-JS runtime, no Tailwind.
- **Vitest + @testing-library/react** for hook/unit tests.
- **Playwright** for a thin smoke-test layer.
- **ESLint (typescript-eslint + react-hooks) + Prettier.**
- **GitHub Actions → GitHub Pages** for deploy.

## Project structure

```
portfolio/
├── src/
│   ├── main.tsx                    # landing entry
│   ├── deck-main.tsx                # deck entry
│   ├── App.tsx                     # landing page composition
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── ParticleField.tsx   # Three.js wrapper, lazy-loaded
│   │   │   ├── Nav.tsx
│   │   │   ├── Marquee.tsx
│   │   │   ├── WorkSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   └── ContactSection.tsx
│   │   ├── deck/
│   │   │   ├── Deck.tsx            # orchestrates slide list + controller
│   │   │   ├── Slide.tsx           # single slide wrapper (scale-to-fit)
│   │   │   ├── slides/             # Slide01Cover.tsx … Slide13Contact.tsx
│   │   │   └── DeckNav.tsx         # arrows, progress dots
│   │   └── shared/
│   │       ├── CustomCursor.tsx
│   │       └── ThemeToggle.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useCursor.ts
│   │   ├── useParallax.ts
│   │   └── useDeckController.ts    # slide index, keyboard nav, fit-scale, hash sync
│   ├── styles/
│   │   ├── tokens.css              # design tokens, light+dark via data-theme
│   │   └── global.css
│   └── types/
│       └── index.ts
├── public/
│   ├── assets/                     # images, moved from /assets
│   └── uploads/                    # CV pdf only
├── legacy/                         # old .dc.html + generated runtimes, kept as reference
├── .github/workflows/deploy.yml
├── vite.config.ts                  # two entries: index.html, deck.html
├── tsconfig.json
├── package.json
└── README.md
```

## Components — key behavior

- **ParticleField.tsx**: Three.js particle hero. `three` as npm dep (no CDN
  script tag — old code loaded an unpinned CDN script, a supply-chain risk).
  Lazy `import()` so it doesn't block first paint. Listens for
  `webglcontextlost` → falls back to a static gradient div. Skips animation
  loop under `prefers-reduced-motion`.
- **useCursor.ts**: custom cursor dot + ring. Guarded by
  `matchMedia('(pointer:fine)')` — listeners never mount on touch devices.
- **useTheme.ts**: defaults from `prefers-color-scheme`, overridable via
  toggle, persisted to `localStorage`. Sets `data-theme` on `<html>`.
- **useDeckController.ts**: slide index state; `ArrowLeft/Right`, `Home/End`
  keyboard nav; `ResizeObserver`-driven scale-to-fit (1920×1080 design canvas
  → viewport); slide index synced to URL hash (`#5`) so a slide is linkable.
- **Slide.tsx / slides/*.tsx**: each slide is a fixed 1920×1080 presentational
  component, no logic — scaling is applied by the controller, not the slide.

## Data flow

No global state library. `ThemeContext` shared by landing (light/dark toggle)
and deck (dark-only, no toggle — matches current deck design). Deck slide
index is local state in `Deck.tsx`, passed down via props — 13 items doesn't
warrant Context.

## Error handling

- WebGL context loss handled explicitly (see above).
- Fonts: Google Fonts `<link>` kept, system-font fallback stack so text is
  never invisible during load.
- Semantic HTML underneath the styling (real `<h1>`, `<nav>`, `<section>`)
  so the page degrades to readable content if JS/CSS fails.

## Testing

- Vitest: `useTheme` (toggle + persistence), `useDeckController` (keyboard
  nav + hash sync) — the only real logic in the app.
- Playwright smoke test: landing loads + theme toggle flips `data-theme`;
  deck loads + arrow key advances slide index.
- No style snapshot tests — brittle, low signal for this project.

## Tooling

- `tsconfig.json`: `strict: true`.
- ESLint + Prettier wired as `npm run lint` / `npm run format`.
- `package.json` scripts: `dev`, `build`, `preview`, `test`, `lint`.

## Deploy

`.github/workflows/deploy.yml`: on push to `main`, `npm ci && npm run build`,
upload `dist/` as a Pages artifact, deploy. `vite.config.ts` sets
`base: '/portfolio/'`. Both entries (`index.html`, `deck.html`) land in
`dist/`.

## Assets

- `assets/*.png` → `public/assets/`.
- `uploads/Stepan-Nikulenko-CV.pdf` → `public/uploads/`, kept as a download
  link.
- Both `.pptx` files (34MB combined) **dropped** — the deck at `/deck` is
  now the live source of truth; the pptx files would immediately go stale.

## Migration of old files

`Landing.dc.html`, `Portfolio.dc.html`, `deck-stage.js`, `support.js` moved
to `legacy/` (not deleted) for reference during the rebuild, removed once
the new implementation is verified equivalent.
