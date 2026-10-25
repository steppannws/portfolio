import { collectSurfaces, spawn, step, type Input, type State, type Surface } from './engine';
import { createRenderer } from './render';
import styles from './climber.module.css';

export interface ClimberOptions {
  /** element the climber drops onto first */
  anchor: HTMLElement;
  pageX: number;
  pageY: number;
}

interface MovingTrack {
  el: HTMLElement;
  baseLeft: number;
  baseTop: number;
  prevLeft: number;
  surfaces: Surface[];
}

const SPRITE = 16;
const FRAMES = 2;
const SURFACE_REFRESH_MS = 500;
// keep the climber inside this band of the viewport by scrolling the page
const FOLLOW_BAND = [0.3, 0.7];

// 16×16 mountaineer, two frames (standing, legs apart). Palette B: cream parka, orange hood.
const PIXELS = [
  '......KKKK......',
  '.....KHHHHK.....',
  '....KHHHHHHK....',
  '....KHFFFFHK.KKK',
  '....KHFKFKHK.KGK',
  '....KHFFFFHK.KKK',
  '.....KFFFFK...B.',
  '....KPPPPPPK..B.',
  '...KPPPPPPPPK.B.',
  '.KPPPPPPPPPPPKB.',
  '.KMKPPPPPPPPKMK.',
  '...KPKKKKKKPK...',
  '...KPPPPPPPPK...',
  '....KKKKKKKK....',
  ['....KKK..KKK....', '...KKK....KKK...'],
  ['...KKKK..KKKK...', '..KKKK....KKKK..'],
];
const PALETTE: Record<string, string> = {
  K: '#141413',
  H: '#dd4318',
  P: '#e9e5db',
  M: '#dd4318',
  F: '#e9e5db',
  B: '#8a5a2b',
  G: '#9a978f',
};

function drawSheet(): HTMLCanvasElement {
  const sheet = document.createElement('canvas');
  sheet.width = SPRITE * FRAMES;
  sheet.height = SPRITE;
  const ctx = sheet.getContext('2d')!;
  for (let frame = 0; frame < FRAMES; frame++) {
    PIXELS.forEach((row, y) => {
      const line = Array.isArray(row) ? row[frame] : row;
      for (let x = 0; x < SPRITE; x++) {
        const colour = PALETTE[line[x]];
        if (!colour) continue;
        ctx.fillStyle = colour;
        ctx.fillRect(frame * SPRITE + x, y, 1, 1);
      }
    });
  }
  return sheet;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

let stopActive: (() => void) | null = null;

export function toggle(opts: ClimberOptions): void {
  if (stopActive) {
    stopActive();
    return;
  }
  stopActive = start(opts);
}

const INTRO_POP_VY = -10.5;
const INTRO_GRAVITY = 1.65;
const INTRO_MAX_FALL = 78;

function start({ anchor, pageX, pageY }: ClimberOptions): () => void {
  const scale = window.innerWidth > 700 ? 4 : 3;
  const size = SPRITE * scale;
  const pageHeight = () => document.documentElement.scrollHeight;

  // reveal all scroll-animated sections and eager-load images so the mountain is stable
  document.querySelectorAll('.reveal-hidden').forEach((el) => el.classList.remove('reveal-hidden'));
  document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    img.loading = 'eager';
  });

  const footerEl = document.querySelector<HTMLElement>('footer');
  const getBaseTop = () => {
    if (footerEl) {
      const r = footerEl.getBoundingClientRect();
      if (r.height > 0) return Math.round(r.top + window.scrollY);
    }
    return pageHeight();
  };

  let staticFloors: Surface[] = [];
  let movingTracks: MovingTrack[] = [];

  const measure = () => {
    const sx = window.scrollX;
    const sy = window.scrollY;
    const baseTop = getBaseTop();
    const movingEls = Array.from(document.querySelectorAll<HTMLElement>('[data-climber-moving]'));
    for (const el of movingEls) el.setAttribute('data-climber-ignore', '');
    staticFloors = collectSurfaces(document.body, size, sx, sy, baseTop).filter(
      (f) => f.top <= baseTop
    );
    for (const el of movingEls) el.removeAttribute('data-climber-ignore');

    movingTracks = movingEls.map((el) => {
      const r = el.getBoundingClientRect();
      const baseLeft = r.left + sx;
      const baseTopTrack = r.top + sy;
      return {
        el,
        baseLeft,
        baseTop: baseTopTrack,
        prevLeft: baseLeft,
        surfaces: collectSurfaces(el, size, sx, sy, Infinity),
      };
    });
  };

  measure();
  const initialBaseTop = getBaseTop();
  const spawnX = clamp(pageX - size / 2, 24, window.innerWidth - size - 24);
  const spawnY = Math.max(24, pageY - size / 2);

  // Ice Climber intro: pop out of the portrait face and plummet all the way to the bottom platform
  let intro = true;
  let state: State = {
    ...spawn(spawnX, spawnY),
    vy: INTRO_POP_VY,
    dropping: initialBaseTop - 1,
  };
  const input: Input = { left: false, right: false, jump: false, jumpHeld: false, drop: false };
  let jumpQueue = 0;
  const triggerJump = () => {
    if (intro) return;
    jumpQueue = Math.min(jumpQueue + 1, 2);
  };

  const renderer = createRenderer(drawSheet(), FRAMES, size);
  renderer.canvas.className = styles.canvas;
  renderer.canvas.setAttribute('data-climber', '');
  document.body.append(renderer.canvas);
  renderer.burst(spawnX + size / 2, spawnY + size / 2, 'pop');
  const ui = buildUi(input, triggerJump, () => toggle({ anchor, pageX, pageY }));

  // the page follows the climber frame by frame, so smooth scrolling would lag behind
  const html = document.documentElement;
  const prevScrollBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return toggle({ anchor, pageX, pageY });
    if (e.key === 'ArrowLeft') input.left = true;
    else if (e.key === 'ArrowRight') input.right = true;
    else if (e.key === 'ArrowUp') {
      input.jumpHeld = true;
      if (!e.repeat) triggerJump();
    } else if (e.key === 'ArrowDown') {
      if (!intro) input.drop = !e.repeat;
    } else return;
    e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') input.left = false;
    if (e.key === 'ArrowRight') input.right = false;
    if (e.key === 'ArrowUp') input.jumpHeld = false;
  };
  const onBlur = () => {
    input.left = input.right = false;
    input.jumpHeld = false;
  };
  const onResize = () => {
    measure();
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  window.addEventListener('resize', onResize);
  const refresh = window.setInterval(onResize, SURFACE_REFRESH_MS);

  const follow = (cinematic: boolean) => {
    const vh = window.innerHeight;
    const centre = state.y + size / 2;
    const inView = centre - window.scrollY;
    let target = window.scrollY;
    if (cinematic) {
      target = centre - vh * 0.48;
    } else if (inView < vh * FOLLOW_BAND[0]) {
      target = centre - vh * FOLLOW_BAND[0];
    } else if (inView > vh * FOLLOW_BAND[1]) {
      target = centre - vh * FOLLOW_BAND[1];
    }
    target = clamp(target, 0, Math.max(0, pageHeight() - vh));
    const lerp = cinematic ? 0.36 : 0.2;
    if (Math.abs(target - window.scrollY) >= 1) {
      window.scrollTo(0, window.scrollY + (target - window.scrollY) * lerp);
    }
  };

  let last = 0;
  let raf = 0;
  const frame = (now: number) => {
    // dt in 60fps frames, clamped so a background tab doesn't teleport the climber
    const dt = Math.min((now - (last || now)) / (1000 / 60), 3);
    last = now;

    if (intro) {
      const baseTop = getBaseTop();
      state.vy = Math.min(state.vy + INTRO_GRAVITY * dt, INTRO_MAX_FALL);
      state.y += state.vy * dt;
      if (state.vy > 0 && state.y + size >= baseTop) {
        state.y = baseTop - size;
        state.vy = 0;
        state.onGround = true;
        state.jumpsLeft = 1;
        state.dropping = null;
        intro = false;
        measure();
        renderer.burst(state.x + size / 2, baseTop, 'land');
      }
      input.jump = input.drop = false;
      follow(true);
    } else {
      // project moving tracks (e.g. marquee words) to their current frame coordinates and velocity
      const sx = window.scrollX;
      const sy = window.scrollY;
      const dynamicFloors: Surface[] = [];
      for (const track of movingTracks) {
        const r = track.el.getBoundingClientRect();
        const curLeft = r.left + sx;
        const curTop = r.top + sy;
        let dx = curLeft - track.prevLeft;
        if (r.width > 0 && Math.abs(dx) > r.width * 0.25) dx = 0;
        const vx = dt > 0 ? dx / dt : 0;
        track.prevLeft = curLeft;
        const shiftX = curLeft - track.baseLeft;
        const shiftY = curTop - track.baseTop;
        for (const s of track.surfaces) {
          dynamicFloors.push({
            left: s.left + shiftX,
            right: s.right + shiftX,
            top: s.top + shiftY,
            bottom: s.bottom !== undefined ? s.bottom + shiftY : undefined,
            vx,
            group: s.group,
          });
        }
      }

      if (jumpQueue > 0) {
        input.jump = true;
        jumpQueue -= 1;
      }
      const wasAirborne = !state.onGround;
      const prevJumpsLeft = state.jumpsLeft;
      const floors = dynamicFloors.length > 0 ? [...dynamicFloors, ...staticFloors] : staticFloors;
      state = step(state, input, floors, size, window.innerWidth, dt);
      if (wasAirborne && state.jumpsLeft < prevJumpsLeft) {
        renderer.burst(state.x + size / 2, state.y + size, 'jump');
      }
      input.jump = input.drop = false;
      follow(false);
    }

    const walking = state.onGround && (input.left || input.right);
    const pose = !state.onGround || (walking && Math.floor(state.steps / 6) % 2 === 1) ? 1 : 0;
    renderer.draw(state, window.scrollX, window.scrollY, pose, dt, intro);
    // page-space position, readable by tests and tooling
    renderer.canvas.dataset.x = String(Math.round(state.x));
    renderer.canvas.dataset.feet = String(Math.round(state.y + size));

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.clearInterval(refresh);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('resize', onResize);
    html.style.scrollBehavior = prevScrollBehavior;
    ui.remove();
    renderer.dispose();
    stopActive = null;
  };
}

/** Touch pad on coarse pointers, a key hint otherwise, and an exit button always. */
function buildUi(input: Input, onJump: () => void, onExit: () => void): HTMLElement {
  const root = document.createElement('div');
  root.className = styles.ui;
  root.setAttribute('data-climber-ignore', '');

  const button = (label: string, title: string, className = '') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `${styles.btn} ${className}`.trim();
    b.textContent = label;
    b.setAttribute('aria-label', title);
    return b;
  };
  const hold = (b: HTMLButtonElement, down: () => void, up: () => void) => {
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      down();
    });
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) {
      b.addEventListener(type, up);
    }
    return b;
  };

  if (window.matchMedia('(pointer: coarse)').matches) {
    const pad = document.createElement('div');
    pad.className = styles.padLeft;
    pad.append(
      hold(
        button('◀', 'Walk left'),
        () => (input.left = true),
        () => (input.left = false)
      ),
      hold(
        button('▶', 'Walk right'),
        () => (input.right = true),
        () => (input.right = false)
      )
    );
    const actions = document.createElement('div');
    actions.className = styles.padRight;
    const drop = button('▼', 'Drop down', styles.round);
    drop.addEventListener('pointerdown', () => (input.drop = true));
    const jump = hold(
      button('▲', 'Jump', `${styles.round} ${styles.raised}`),
      () => {
        input.jumpHeld = true;
        onJump();
      },
      () => {
        input.jumpHeld = false;
      }
    );
    actions.append(drop, jump);
    root.append(pad, actions);
  } else {
    const hint = document.createElement('div');
    hint.className = styles.hint;
    hint.textContent = '← → walk · ↑↑ double jump · ↓ drop · esc exit';
    root.append(hint);
  }

  const exit = button('×', 'Exit game', styles.close);
  exit.addEventListener('click', onExit);
  root.append(exit);

  document.body.append(root);
  return root;
}
