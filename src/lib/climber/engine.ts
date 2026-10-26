/**
 * Platformer core, kept free of DOM and rendering so it can grow a third axis later.
 * Page-pixel coordinates, y down. One time unit (dt = 1) is a 60fps frame.
 */

/** A one-way floor: the top edge of a page element, glyph run, or border, in page pixels. */
export interface Surface {
  left: number;
  right: number;
  top: number;
  /** bottom edge of a moving obstacle/word (optional), used to displace the player when it sweeps by */
  bottom?: number;
  /** horizontal velocity in px per 60fps frame (negative = moving left) */
  vx?: number;
  /** contour group id so the climber can step across letter/image relief within the same element */
  group?: number;
}

export interface Input {
  left: boolean;
  right: boolean;
  /** one-shot: consumed by the step that sees it */
  jump: boolean;
  /** whether the jump button is currently held down (for variable-height arcade hops) */
  jumpHeld?: boolean;
  /** one-shot: fall through the current floor */
  drop: boolean;
}

export interface State {
  /** top-left corner of the sprite box */
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  /** remaining mid-air jumps (1 after jumping from ground, 0 after double-jumping) */
  jumpsLeft: number;
  /** top of the floor being dropped through; ignored until the feet pass it */
  dropping: number | null;
  facing: 1 | -1;
  /** walk-cycle counter, advances only while walking on a floor */
  steps: number;
}

export const GRAVITY = 0.5;
export const MAX_FALL = 14;
export const WALK = 3;
export const MAX_RUN = 5.2;
export const JUMP_VX_BOOST = 1.35;
export const MAX_AIR_VX = 6.2;
export const AIR_ACCEL = 0.45;
export const AIR_DRAG = 0.96;
export const JUMP_SPEED_BONUS = 0.14;
// apex ≈ JUMP² / (2 · GRAVITY) = 196px, enough to climb from the surname to the first name
export const JUMP = -14;
// a floor that shifts this much under the feet (reveal fades, late layout) carries the climber along
export const SNAP = 12;
// max vertical step (as a fraction of sprite size) when walking along glyph/image relief in one group
export const STEP_RELIEF = 0.85;

export function spawn(x: number, y: number): State {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    onGround: false,
    jumpsLeft: 0,
    dropping: null,
    facing: 1,
    steps: 0,
  };
}

// a floor holds the sprite while its horizontal centre is over it
const holds = (floor: Surface, x: number, size: number) => {
  const centre = x + size / 2;
  return centre >= floor.left && centre <= floor.right;
};

const holdsMoving = (floor: Surface, x: number, size: number, dt: number) =>
  holds(floor, x, size) || (floor.vx ? holds(floor, x + floor.vx * dt, size) : false);

export function step(
  prev: State,
  input: Input,
  floors: Surface[],
  size: number,
  viewportWidth: number,
  dt = 1
): State {
  const s: State = {
    ...prev,
    vx: prev.vx ?? 0,
    jumpsLeft: prev.jumpsLeft ?? (prev.onGround ? 1 : 0),
  };
  const wasOnGround = s.onGround;
  const feetBefore = s.y + size;
  const xBefore = s.x;

  const prevFloor = wasOnGround
    ? floors.find((f) => Math.abs(f.top - feetBefore) <= SNAP && holdsMoving(f, xBefore, size, dt))
    : undefined;

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (wasOnGround) {
    if (dir) {
      s.facing = dir > 0 ? 1 : -1;
      const runRamp = Math.min(Math.max(s.steps - 9, 0) / 30, 1);
      const groundSpeed = WALK + (MAX_RUN - WALK) * runRamp;
      s.vx = dir * groundSpeed;
      s.x += s.vx * dt;
      s.steps += dt;
    } else {
      s.vx *= Math.pow(0.65, dt);
      if (Math.abs(s.vx) < 0.1) s.vx = 0;
      s.x += s.vx * dt;
    }
  } else {
    if (dir) {
      s.facing = dir > 0 ? 1 : -1;
      const targetSpeed = Math.min(Math.max(Math.abs(s.vx), WALK * JUMP_VX_BOOST), MAX_AIR_VX);
      const targetVx = dir * targetSpeed;
      const diff = targetVx - s.vx;
      s.vx += Math.sign(diff) * Math.min(Math.abs(diff), AIR_ACCEL * dt);
    } else {
      s.vx *= Math.pow(AIR_DRAG, dt);
      if (Math.abs(s.vx) < 0.05) s.vx = 0;
    }
    s.x += s.vx * dt;
  }

  let under: Surface | undefined;
  if (s.onGround) {
    for (const f of floors) {
      if (Math.abs(f.top - feetBefore) <= SNAP && holdsMoving(f, s.x, size, dt)) {
        if (!under || f.top < under.top) under = f;
      }
    }
    // step smoothly up or down across adjacent glyph/image relief segments of the same element
    if (!under && prevFloor?.group !== undefined) {
      const maxRelief = size * STEP_RELIEF;
      for (const f of floors) {
        if (
          f.group === prevFloor.group &&
          Math.abs(f.top - feetBefore) <= maxRelief &&
          holdsMoving(f, s.x, size, dt)
        ) {
          if (!under || f.top < under.top) under = f;
        }
      }
    }

    if (!under) {
      s.onGround = false;
      s.vy = 0;
      s.jumpsLeft = 0;
    } else {
      if (under.vx) s.x += under.vx * dt;
      if (input.jump) {
        s.onGround = false;
        if (dir || Math.abs(s.vx) > 0.2) {
          const boostDir = dir || Math.sign(s.vx);
          const boosted = Math.max(Math.abs(s.vx), WALK) * JUMP_VX_BOOST;
          s.vx = boostDir * Math.min(boosted, MAX_AIR_VX);
        }
        const speedRatio = Math.min(Math.abs(s.vx) / MAX_RUN, 1);
        s.vy = JUMP * (1 + JUMP_SPEED_BONUS * speedRatio);
        s.jumpsLeft = 1;
      } else if (input.drop) {
        s.onGround = false;
        s.vy = 0;
        s.dropping = under.top;
        s.jumpsLeft = 0;
      } else {
        s.y = under.top - size;
        s.jumpsLeft = 1;
      }
    }
  }

  if (!s.onGround) {
    // second jump in a row when pressing jump again in the air
    if (!wasOnGround && input.jump && s.jumpsLeft > 0) {
      s.jumpsLeft -= 1;
      s.dropping = null;
      if (dir) {
        s.vx = dir * Math.min(Math.max(Math.abs(s.vx), WALK) * JUMP_VX_BOOST, MAX_AIR_VX);
      }
      const speedRatio = Math.min(Math.abs(s.vx) / MAX_RUN, 1);
      const jumpImpulse = JUMP * (1 + JUMP_SPEED_BONUS * speedRatio);
      s.vy = s.vy < 0 ? -Math.hypot(s.vy, jumpImpulse) : jumpImpulse;
    }

    // releasing jump early cuts upward velocity for arcade-style short hops
    if (input.jumpHeld === false && s.vy < -4) {
      s.vy *= Math.pow(0.82, dt);
    }

    s.vy = Math.min(s.vy + GRAVITY * dt, MAX_FALL);
    s.y += s.vy * dt;
    const feetAfter = s.y + size;
    if (s.vy > 0) {
      // land on the highest floor whose top edge the feet crossed this frame
      let landing: Surface | undefined;
      for (const f of floors) {
        if (s.dropping !== null && f.top <= s.dropping) continue;
        if (f.top < feetBefore || f.top > feetAfter || !holdsMoving(f, s.x, size, dt)) continue;
        if (!landing || f.top < landing.top) landing = f;
      }
      if (landing) {
        s.y = landing.top - size;
        s.vy = 0;
        s.onGround = true;
        s.jumpsLeft = 1;
        under = landing;
        if (landing.vx) s.x += landing.vx * dt;
      }
    }
    if (s.dropping !== null && feetAfter > s.dropping) s.dropping = null;
  }

  // displace the player horizontally when a moving banner word sweeps past their body
  if (!under?.vx) {
    const bodyLeft = s.x + size * 0.2;
    const bodyRight = s.x + size * 0.8;
    const feetNow = s.y + size;
    for (const f of floors) {
      if (!f.vx || f.bottom === undefined) continue;
      if (feetNow > f.top + 2 && s.y < f.bottom && bodyRight > f.left && bodyLeft < f.right) {
        s.x += f.vx * dt;
        break;
      }
    }
  }

  // arcade wrap: once the centre leaves one edge it enters from the other
  if (s.x + size / 2 < 0) s.x += viewportWidth;
  else if (s.x + size / 2 > viewportWidth) s.x -= viewportWidth;

  return s;
}

let measureCtx: CanvasRenderingContext2D | null | undefined;
function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (measureCtx === undefined) {
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
      measureCtx = null;
    } else {
      try {
        measureCtx = document.createElement('canvas').getContext('2d');
      } catch {
        measureCtx = null;
      }
    }
  }
  return measureCtx;
}

const imageProfileCache = new Map<string, Array<number | null>>();
let profileCanvas: HTMLCanvasElement | null = null;

function getImageProfile(img: HTMLImageElement): Array<number | null> | null {
  const key = img.currentSrc || img.src;
  if (!key || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) return null;
  const cached = imageProfileCache.get(key);
  if (cached) return cached;

  try {
    const cols = 48;
    const rows = 48;
    profileCanvas ??= document.createElement('canvas');
    profileCanvas.width = cols;
    profileCanvas.height = rows;
    const ctx = profileCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.clearRect(0, 0, cols, rows);
    ctx.drawImage(img, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    const profile: Array<number | null> = [];
    for (let x = 0; x < cols; x++) {
      let topRow: number | null = null;
      for (let y = 0; y < rows; y++) {
        if (data[(y * cols + x) * 4 + 3] > 24) {
          topRow = y / rows;
          break;
        }
      }
      profile.push(topRow);
    }
    imageProfileCache.set(key, profile);
    return profile;
  } catch {
    return null;
  }
}

let nextGroup = 1;

function transformChar(ch: string, textTransform: string): string {
  if (textTransform === 'uppercase') return ch.toUpperCase();
  if (textTransform === 'lowercase') return ch.toLowerCase();
  return ch;
}

function measureGlyphOffsets(
  ctx: CanvasRenderingContext2D | null,
  sample: string,
  rectHeight: number
): { topOffset: number; bottomOffset: number } {
  if (!ctx || !sample) return { topOffset: 0, bottomOffset: rectHeight };
  // punctuation uses 'x' so periods/commas do not create deep spikes in a word's contour
  const probe = /[a-zA-Z0-9\u00C0-\u024F+∞]/.test(sample) ? sample : 'x';
  const m = ctx.measureText(probe);
  const fontAscent = m?.fontBoundingBoxAscent ?? 0;
  const fontDescent = m?.fontBoundingBoxDescent ?? 0;
  const glyphAscent = m?.actualBoundingBoxAscent ?? 0;
  const glyphDescent = m?.actualBoundingBoxDescent ?? 0;
  const fontBox = fontAscent + fontDescent;
  if (fontBox <= 0 || glyphAscent <= 0) return { topOffset: 0, bottomOffset: rectHeight };
  const scale = rectHeight / fontBox;
  return {
    topOffset: Math.max(0, (fontAscent - glyphAscent) * scale),
    bottomOffset: Math.min(rectHeight, (fontAscent + glyphDescent) * scale),
  };
}

function extractTextSurfaces(
  el: Element,
  r: DOMRect,
  style: CSSStyleDeclaration,
  scrollX: number,
  scrollY: number,
  group: number
): Surface[] {
  const fontSize = parseFloat(style.fontSize) || 16;
  const ctx = getMeasureCtx();
  const range = document.createRange();
  const segments: Surface[] = [];

  if (fontSize >= 20) {
    // per-character glyph relief for headings, hero display type, and marquee words
    const walkText = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? '';
        if (!text.trim()) return;
        const parentEl = node.parentElement ?? el;
        const pStyle = parentEl === el ? style : getComputedStyle(parentEl);
        const pSize = parseFloat(pStyle.fontSize) || fontSize;
        if (ctx) {
          ctx.font = `${pStyle.fontStyle} ${pStyle.fontWeight} ${pSize}px ${pStyle.fontFamily}`;
        }
        for (let i = 0; i < text.length; i++) {
          if (/\s/.test(text[i])) continue;
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const cRect = range.getBoundingClientRect?.();
          if (!cRect || cRect.width <= 0 || cRect.height <= 0) continue;
          const rendered = transformChar(text[i], pStyle.textTransform);
          const { topOffset, bottomOffset } = measureGlyphOffsets(ctx, rendered, cRect.height);
          const seg: Surface = {
            left: cRect.left + scrollX,
            right: cRect.right + scrollX,
            top: Math.round(cRect.top + topOffset + scrollY),
            bottom: Math.round(cRect.top + bottomOffset + scrollY),
            group,
          };
          const prev = segments[segments.length - 1];
          if (prev && seg.left >= prev.left && seg.left - prev.right <= pSize * 0.65) {
            prev.right = seg.left;
            if (Math.abs(prev.top - seg.top) <= 1.5) {
              prev.right = seg.right;
              prev.top = Math.min(prev.top, seg.top);
              prev.bottom = Math.max(prev.bottom ?? 0, seg.bottom ?? 0);
              continue;
            }
          }
          segments.push(seg);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) walkText(child);
      }
    };
    walkText(el);
  } else {
    // per-line glyph top for smaller body copy and labels
    if (ctx) {
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    }
    range.selectNodeContents(el);
    const rects = range.getClientRects?.();
    if (rects && rects.length > 0) {
      const sample = transformChar((el.textContent ?? 'x').trim()[0] ?? 'x', style.textTransform);
      for (const lRect of Array.from(rects)) {
        if (lRect.width <= 0 || lRect.height <= 0) continue;
        const { topOffset, bottomOffset } = measureGlyphOffsets(ctx, sample, lRect.height);
        segments.push({
          left: lRect.left + scrollX,
          right: lRect.right + scrollX,
          top: Math.round(lRect.top + topOffset + scrollY),
          bottom: Math.round(lRect.top + bottomOffset + scrollY),
          group,
        });
      }
    }
  }

  if (segments.length > 1) return segments;
  if (segments.length === 1) {
    const [{ left, right, top, bottom }] = segments;
    return [{ left, right, top, ...(bottom !== undefined ? { bottom } : {}) }];
  }

  // fallback when Range layout rects are unavailable (e.g. JSDOM tests)
  range.selectNodeContents(el);
  const ink = range.getBoundingClientRect?.();
  const left = ink && ink.width > 0 ? ink.left : r.left;
  const right = ink && ink.width > 0 ? ink.right : r.right;
  const top = ink && ink.height > 0 ? ink.top : r.top;
  return [{ left: left + scrollX, right: right + scrollX, top: top + scrollY }];
}

function extractImageSurfaces(
  img: HTMLImageElement,
  r: DOMRect,
  scrollX: number,
  scrollY: number,
  group: number
): Surface[] {
  const profile = getImageProfile(img);
  if (!profile) {
    return [{ left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY }];
  }
  const cols = profile.length;
  const colWidth = r.width / cols;
  const segments: Surface[] = [];
  for (let i = 0; i < cols; i++) {
    const ratio = profile[i];
    if (ratio === null) continue;
    const left = r.left + i * colWidth + scrollX;
    const right = r.left + (i + 1) * colWidth + scrollX;
    const top = Math.round(r.top + ratio * r.height + scrollY);
    const prev = segments[segments.length - 1];
    if (prev && Math.abs(prev.right - left) <= 1 && Math.abs(prev.top - top) <= 3) {
      prev.right = right;
      prev.top = Math.min(prev.top, top);
    } else {
      segments.push({ left, right, top, group });
    }
  }
  if (segments.length > 1) return segments;
  if (segments.length === 1) {
    const [{ left, right, top }] = segments;
    return [{ left, right, top }];
  }
  return [{ left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY }];
}

/** All floor segments an element offers: glyph relief, media silhouette, and visible borders. */
export function floorsOf(el: Element, scrollX: number, scrollY: number): Surface[] {
  const r = el.getBoundingClientRect();
  if (r.height <= 0 || r.width <= 0) return [];

  const style = getComputedStyle(el);
  const media =
    el instanceof HTMLImageElement ||
    el instanceof SVGSVGElement ||
    el instanceof HTMLVideoElement ||
    el instanceof HTMLCanvasElement;
  const hasDirectText = Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim()
  );

  const bt = parseFloat(style.borderTopWidth) || 0;
  const bb = parseFloat(style.borderBottomWidth) || 0;
  const bl = parseFloat(style.borderLeftWidth) || 0;
  const br = parseFloat(style.borderRightWidth) || 0;
  const hasTopBorder = bt > 0 && style.borderTopStyle !== 'none';
  const hasBottomBorder = bb > 0 && style.borderBottomStyle !== 'none';
  const isBoxBorder =
    hasTopBorder &&
    hasBottomBorder &&
    bl > 0 &&
    br > 0 &&
    style.borderLeftStyle !== 'none' &&
    style.borderRightStyle !== 'none';

  const out: Surface[] = [];
  const group = nextGroup++;

  // bordered pills/chips: walk on the top border of the component box
  if (isBoxBorder) {
    out.push({ left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY });
    return out;
  }

  // top border edge of sections, cards, strips, and tables
  if (hasTopBorder) {
    out.push({ left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY });
  }

  // bottom border edge of rows and rules (when not an inline text underline)
  if (hasBottomBorder && !hasDirectText) {
    out.push({
      left: r.left + scrollX,
      right: r.right + scrollX,
      top: r.bottom - bb + scrollY,
    });
  }

  // section stock transitions (e.g. paper <-> band)
  if (el.getAttribute('data-surface') === 'band') {
    if (!el.querySelector('[data-climber-moving]')) {
      out.push({ left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY });
    }
    out.push({ left: r.left + scrollX, right: r.right + scrollX, top: r.bottom + scrollY });
  }

  // eyebrow horizontal hairline rule
  if (el.classList.contains('eyebrow')) {
    out.push({
      left: r.left + scrollX,
      right: r.right + scrollX,
      top: Math.round(r.top + r.height / 2 + scrollY),
    });
  }

  if (el instanceof HTMLImageElement) {
    out.push(...extractImageSurfaces(el, r, scrollX, scrollY, group));
  } else if (media) {
    out.push({ left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY });
  } else if (hasDirectText) {
    out.push(...extractTextSurfaces(el, r, style, scrollX, scrollY, group));
  }

  return out;
}

/** The overall bounding floor an element offers (spanning its full width at its highest point). */
export function floorOf(el: Element, scrollX: number, scrollY: number): Surface | null {
  const list = floorsOf(el, scrollX, scrollY);
  if (list.length === 0) return null;
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  for (const s of list) {
    if (s.left < left) left = s.left;
    if (s.right > right) right = s.right;
    if (s.top < top) top = s.top;
  }
  return { left, right, top };
}

/**
 * Every visible element with its own text, media, or border is a floor, except fixed/sticky
 * chrome and anything under `data-climber-ignore`. The page bottom is the last floor.
 */
export function collectSurfaces(
  root: Element,
  minWidth: number,
  scrollX: number,
  scrollY: number,
  pageHeight: number
): Surface[] {
  const out: Surface[] = [];
  const visit = (el: Element, parentHasDirectText = false) => {
    if (el.hasAttribute('data-climber-ignore')) return;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    if (style.position === 'fixed' || style.position === 'sticky') return;
    if (
      style.opacity === '0' &&
      !el.classList.contains('reveal-hidden') &&
      !el.parentElement?.classList.contains('reveal-hidden')
    ) {
      return;
    }

    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim()
    );

    if (!parentHasDirectText || !hasDirectText) {
      const segments = floorsOf(el, scrollX, scrollY);
      if (segments.length > 0) {
        let minLeft = Infinity;
        let maxRight = -Infinity;
        for (const s of segments) {
          if (s.left < minLeft) minLeft = s.left;
          if (s.right > maxRight) maxRight = s.right;
        }
        if (maxRight - minLeft >= minWidth) {
          out.push(...segments);
        }
      }
    }

    for (const child of el.children) visit(child, hasDirectText);
  };
  visit(root);
  if (Number.isFinite(pageHeight)) {
    out.push({ left: -Infinity, right: Infinity, top: pageHeight });
  }
  return out;
}
