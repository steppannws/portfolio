import { useEffect, useRef, useState } from 'react';
import { asset } from '../../lib/asset';
import { toggleClimber } from '../../lib/climber';
import { Cameo } from './Cameo';
import { lure } from '../../lib/cameoLure';
import styles from './Hero.module.css';

// fonts swap in fine late, so never hold the page on them longer than this
const MAX_FONT_WAIT_MS = 4000;

const META = [
  { label: 'Role', value: 'Technical Lead' },
  { label: 'Focus', value: 'AI · Mobile · Backend · Full-stack' },
  { label: 'Based', value: 'Buenos Aires, AR — Remote' },
  { label: 'Status', value: 'Open to work', live: true },
];

// the face, in the portrait's source pixels (1280×720)
const FACE = { left: 190, top: 30, right: 390, bottom: 260 };

/** Maps a viewport point on the portrait (object-fit: cover, anchored 0% 100%) back to the face. */
export function isOnFace(img: HTMLImageElement, x: number, y: number): boolean {
  const rect = img.getBoundingClientRect();
  const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
  const sourceX = (x - rect.left) / scale;
  const sourceY = (y - rect.top - (rect.height - img.naturalHeight * scale)) / scale;
  return (
    sourceX >= FACE.left && sourceX <= FACE.right && sourceY >= FACE.top && sourceY <= FACE.bottom
  );
}

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];
const CAMEO_AFTER_MS = 4000;
// the cameo's speech bubble cycles through these; first one waits for the walk-in to finish
const CAMEO_WALK_MS = 3600;
// he stands quietly for a beat after walking in, before the first message
const CAMEO_QUIET_MS = 3000;
const CAMEO_FIRST_MS = CAMEO_WALK_MS + CAMEO_QUIET_MS;
const CAMEO_LEAP_MS = 800;
const CAMEO_POOF_MS = 700;
// [dx, dy] in px: where each sparkle of the vanishing puff flies to
const POOF_SPARKS = [
  [-34, -30],
  [0, -44],
  [34, -30],
  [-44, 0],
  [44, 0],
  [-30, 22],
  [0, 30],
  [30, 22],
];
// show: how long the bubble stays up; gap: silence before the next one (the last gap builds the goodbye)
const CAMEO_MESSAGES = [
  { text: 'Hey visitor, up for a climb?', show: 3500, gap: 1500 },
  { text: 'Tap me. I climb mountains and scale systems.', show: 5000, gap: 2500 },
  { text: 'Fifteen years in, still learning, still helping systems scale.', show: 6500, gap: 5000 },
  {
    text: 'Ok, cool, I’m leaving you for now. Touch my nose if you wanna play.',
    show: 6500,
    gap: 0,
  },
];
let consoleNoted = false;

export function Hero() {
  const portraitRef = useRef<HTMLImageElement>(null);
  const surnameRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  // the climber peeks over the surname after a beat, until the game has been started once
  const [cameo, setCameo] = useState(false);
  const [played, setPlayed] = useState(false);
  // one past the last message he leaps, the one after that he vanishes in a puff, then he is gone for good
  const [messageIndex, setMessageIndex] = useState(0);

  // the pickaxe starts on his left, swaps sides now and then with a new line, and is on his right for the leap
  const [flipped, setFlipped] = useState(true);

  const launch = (pageX: number, pageY: number) => {
    if (!surnameRef.current) return;
    setPlayed(true);
    lure.engaged = true;
    void toggleClimber({ anchor: surnameRef.current, pageX, pageY });
  };

  useEffect(() => {
    if (!cameo || played || messageIndex > CAMEO_MESSAGES.length + 1) return;
    const wait =
      messageIndex === CAMEO_MESSAGES.length + 1
        ? CAMEO_POOF_MS
        : messageIndex === CAMEO_MESSAGES.length
          ? CAMEO_LEAP_MS
          : (messageIndex === 0 ? CAMEO_FIRST_MS : 0) +
            CAMEO_MESSAGES[messageIndex].show +
            CAMEO_MESSAGES[messageIndex].gap;
    const timer = setTimeout(() => setMessageIndex((i) => i + 1), wait);
    return () => clearTimeout(timer);
  }, [cameo, played, messageIndex]);

  // sporadic: he only turns when a new line pops up, and not every time
  useEffect(() => {
    if (messageIndex === CAMEO_MESSAGES.length) setFlipped(false);
    else if (messageIndex > 0 && Math.random() < 0.5) setFlipped((f) => !f);
  }, [messageIndex]);

  // easter egg lures: the cameo for visitors, a console note and Konami for devs
  useEffect(() => {
    const img = portraitRef.current;
    if (!img) return;
    const launchFromFace = () => {
      const rect = img.getBoundingClientRect();
      launch(
        rect.left + window.scrollX + rect.width * 0.3,
        rect.top + window.scrollY + rect.height * 0.2
      );
    };

    lure.launch = launch;
    const timer = setTimeout(() => {
      setCameo(true);
      // only counts as seen if the hero is still on screen when he walks in
      const { top, bottom } = img.getBoundingClientRect();
      if (bottom > 0 && top < window.innerHeight) lure.engaged = true;
    }, CAMEO_AFTER_MS);

    const w = window as unknown as { climb?: () => void };
    w.climb = launchFromFace;
    // module-level guard: StrictMode runs effects twice in dev and would print this twice
    if (!consoleNoted) {
      consoleNoted = true;
      console.log(
        '%c ▲ STEPAN %c a tiny mountaineer lives on this page — run %cclimb()%c to meet him ',
        'background:#dd4318;color:#e9e5db;font:700 12px/22px monospace;border-radius:4px 0 0 4px',
        'background:#141413;color:#e9e5db;font:12px/22px monospace',
        'background:#141413;color:#f4b942;font:700 12px/22px monospace',
        'background:#141413;color:#e9e5db;font:12px/22px monospace;border-radius:0 4px 4px 0'
      );
    }

    let progress = 0;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        launchFromFace();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      delete w.climb;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // wait for the portrait and webfonts so the entrance plays once on finished content
  useEffect(() => {
    let live = true;
    // decode() settles on load or error, so the portrait wait cannot hang
    const portrait = portraitRef.current?.decode?.().catch(() => {});
    const fonts = Promise.race([
      document.fonts?.ready,
      new Promise((resolve) => setTimeout(resolve, MAX_FONT_WAIT_MS)),
    ]);
    Promise.all([portrait, fonts]).then(() => {
      if (!live) return;
      setReady(true);
      // the loader lives in index.html so it paints before any JS arrives
      document.getElementById('boot-loader')?.classList.add('done');
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section
      id="top"
      data-surface="paper"
      className={`${styles.hero} ${ready ? '' : styles.loading}`}
    >
      <div className={`shell ${styles.inner}`}>
        <div className={styles.type}>
          <h1 className={`display ${styles.name}`}>
            <span className={styles.nameBack}>Stepan</span>{' '}
            <span ref={surnameRef} className={styles.nameFront}>
              Nikulenko
            </span>
          </h1>
          <p className={styles.role}>
            AI <span className="serif">&amp;</span> full-stack engineer, fifteen years
            hands-on&nbsp;— building LLM-powered, agentic products end to end.
          </p>
        </div>
        <div className={styles.portrait}>
          <img
            ref={portraitRef}
            src={asset('assets/image6-light.webp')}
            alt="Stepan Nikulenko"
            className={styles.portraitImage}
            data-climber-ignore
            // easter egg: tap the face and a pixel mountaineer drops onto the surname
            onClick={(event) => {
              if (!isOnFace(event.currentTarget, event.clientX, event.clientY)) return;
              launch(event.pageX, event.pageY);
            }}
          />
          {cameo && !played && messageIndex <= CAMEO_MESSAGES.length && (
            <button
              type="button"
              className={`${styles.cameo} ${flipped ? styles.flipped : ''} ${
                messageIndex === CAMEO_MESSAGES.length ? styles.leap : ''
              }`}
              aria-label="Start the climbing game"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                launch(rect.left + window.scrollX + rect.width / 2, rect.top + window.scrollY);
              }}
            >
              <Cameo />
              {messageIndex < CAMEO_MESSAGES.length && (
                <span
                  key={messageIndex}
                  className={styles.cameoSpeech}
                  style={{
                    animationDuration: `${CAMEO_MESSAGES[messageIndex].show}ms`,
                    animationDelay: messageIndex === 0 ? `${CAMEO_FIRST_MS}ms` : '0ms',
                  }}
                >
                  {CAMEO_MESSAGES[messageIndex].text}
                </span>
              )}
            </button>
          )}
          {cameo && !played && messageIndex === CAMEO_MESSAGES.length + 1 && (
            <span className={styles.poof} aria-hidden="true">
              {POOF_SPARKS.map(([dx, dy], i) => (
                <i
                  key={i}
                  style={{ '--dx': `${dx}px`, '--dy': `${dy}px` } as React.CSSProperties}
                />
              ))}
            </span>
          )}
        </div>
      </div>
      <div className={`shell ${styles.metaStrip}`}>
        {META.map((item) => (
          <div key={item.label} className={styles.metaCell}>
            <span className={styles.metaLabel}>{item.label}</span>
            <span className={styles.metaValue}>
              {item.live && <span className={styles.live} />}
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
