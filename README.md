# Stepan Nikulenko — Portfolio

Personal portfolio: an interactive landing page and a presentation deck, built as self-contained streaming **Design Components** (`.dc.html`). No build step — open the HTML files directly in a browser.

## Contents

| File | What it is |
|------|-----------|
| `Landing.dc.html` | Interactive landing page — Three.js particle hero, custom cursor, parallax, light/dark theme toggle |
| `Portfolio.dc.html` | 13-slide presentation deck (projects, about, contact) |
| `deck-stage.js` | Slide-deck runtime used by the deck |
| `support.js` | Design Component runtime |
| `assets/` | App screenshots, portrait, project imagery |

## Running locally

No dependencies or build. Just serve the folder with any static server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000/Landing.dc.html`.

Opening the files with `file://` also works, but a local server avoids browser restrictions on some assets.

## Stack

- Vanilla HTML + inline styles (Design Component format)
- [Three.js](https://threejs.org/) for the hero particle field
- Fonts: Space Grotesk, Instrument Sans, Space Mono (Google Fonts)

## Author

**Stepan Nikulenko** — Technical Lead · Mobile & Full-Stack Engineer
Buenos Aires, Argentina · Remote

- Email: stepan.nikulenko@gmail.com
- LinkedIn: [in/stepann](https://www.linkedin.com/in/stepann/)
- GitHub: [@steppannws](https://github.com/steppannws)
- Stack Overflow: [stepan-nikulenko](https://stackoverflow.com/users/6078160/stepan-nikulenko)
- Behance: [stepan](https://www.behance.net/stepan)
