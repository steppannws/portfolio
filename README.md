# Stepan Nikulenko — Portfolio

Personal portfolio: an interactive landing page and a 13-slide presentation
deck. Vite + React + TypeScript, plain CSS Modules over design tokens, tested
with Vitest and Playwright, deployed to GitHub Pages via Actions.

**Live:** https://steppannws.github.io/portfolio/

## Pages

| Entry                      | What it is                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `index.html` → `/`         | Landing — editorial one-pager: paper/band alternating sections, oversized display type, light/dark |
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
- **Two surfaces, not a colour palette** (`src/styles/tokens.css`) — the landing
  alternates between two paper stocks: `paper` (default) and `band`
  (`data-surface="band"` on a section). Components only ever read the neutral
  tokens `--bg`, `--ink`, `--muted`, `--faint`, `--hair`, so a section inverts
  by switching stock. `data-theme` on `<html>` swaps which stock is dark, so the
  alternating rhythm survives in both themes. The deck is dark-only and uses its
  own literal palette.
- **Shared editorial primitives** live in `src/styles/global.css` as global
  classes — `.shell` (12-column measure), `.grid12`, `.eyebrow` (numbered
  section rule), `.display`, `.serif` (the one italic counterpoint, used twice
  on the page), `.chip`. Section CSS Modules compose on top.
- **Logic lives in hooks** (`src/hooks/`) — `useTheme` (persistence +
  OS-preference default), `useReveal` (in-view fade) and `useDeckController`
  (slide index, keyboard nav, hash sync, scale-to-fit). Components stay
  presentational.
- **Work is two-tier** — 4 flagships via `FlagshipProject` (text column on the
  grid + a visual that bleeds off the page edge for imagery, `bleed={false}` for
  text-based visuals) and 6 archive rows via `WorkIndex`, driven by
  `src/data/compactProjects.ts`. **8 deck project slides** — all data-driven via
  one `ProjectSlide`.
- **No canvas, no custom cursor** — the landing is type, rules and imagery; the
  only motion is the skill marquee and a 10px in-view fade, both disabled under
  `prefers-reduced-motion`.

## Author

**Stepan Nikulenko** — Technical Lead · Mobile & Full-Stack Engineer
Buenos Aires, Argentina · Remote

- Email: stepan.nikulenko@gmail.com
- LinkedIn: [in/stepann](https://www.linkedin.com/in/stepann/)
- GitHub: [@steppannws](https://github.com/steppannws)
- Stack Overflow: [stepan-nikulenko](https://stackoverflow.com/users/6078160/stepan-nikulenko)
- Behance: [stepan](https://www.behance.net/stepan)
