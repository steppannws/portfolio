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
