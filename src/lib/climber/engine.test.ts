import { describe, expect, it } from 'vitest';
import { collectSurfaces, spawn, step, type Input, type State, type Surface } from './engine';

const SIZE = 64;
const VIEW = 1000;
const idle: Input = { left: false, right: false, jump: false, drop: false };

/** Runs `frames` steps; `first` applies to the first frame only, `held` to every frame. */
function run(
  state: State,
  floors: Surface[],
  frames: number,
  held = idle,
  first: Partial<Input> = {}
): State {
  let s = state;
  for (let i = 0; i < frames; i++) {
    s = step(s, i === 0 ? { ...held, ...first } : held, floors, SIZE, VIEW);
  }
  return s;
}

describe('step', () => {
  const floor: Surface = { left: 0, right: 300, top: 400 };
  const standing = (): State => ({ ...spawn(100, 400 - SIZE), onGround: true });

  it('falls onto the first floor under its feet', () => {
    const s = run(spawn(100, 0), [floor], 120);
    expect(s.onGround).toBe(true);
    expect(s.y).toBe(400 - SIZE);
  });

  it('walks, faces the way it walks, and falls off the edge onto the floor below', () => {
    const lower: Surface = { left: 0, right: 1000, top: 700 };
    let s = run(standing(), [floor, lower], 10, { ...idle, right: true });
    expect(s.x).toBe(130);
    expect(s.facing).toBe(1);
    expect(s.onGround).toBe(true);

    s = run(s, [floor, lower], 120, { ...idle, right: true });
    expect(s.onGround).toBe(true);
    expect(s.y).toBe(700 - SIZE);
    expect(s.x).toBeGreaterThan(300 - SIZE / 2);
  });

  it('jumps up onto a floor within reach and passes through it on the way up', () => {
    const upper: Surface = { left: 0, right: 300, top: 250 };
    const s = run(standing(), [floor, upper], 90, idle, { jump: true });
    expect(s.onGround).toBe(true);
    expect(s.y).toBe(250 - SIZE);
  });

  it('comes back down when nothing is within jump reach', () => {
    const tooHigh: Surface = { left: 0, right: 300, top: 100 };
    const s = run(standing(), [floor, tooHigh], 90, idle, { jump: true });
    expect(s.y).toBe(400 - SIZE);
  });

  it('performs a second jump in a row when jump is pressed twice rapidly', () => {
    // floor is at 400; 100 is 300px above (out of single-jump reach ~196px, within double-jump ~392px)
    const highLedge: Surface = { left: 0, right: 300, top: 100 };
    let s = run(standing(), [floor, highLedge], 4, idle, { jump: true });
    expect(s.onGround).toBe(false);
    expect(s.jumpsLeft).toBe(1);

    // second jump rapidly while still rising; a third jump in mid-air does nothing
    s = step(s, { ...idle, jump: true }, [floor, highLedge], SIZE, VIEW);
    expect(s.jumpsLeft).toBe(0);
    const vyAfterSecond = s.vy;
    s = step(s, { ...idle, jump: true }, [floor, highLedge], SIZE, VIEW);
    expect(s.vy).toBeGreaterThan(vyAfterSecond);

    s = run(s, [floor, highLedge], 90);
    expect(s.onGround).toBe(true);
    expect(s.y).toBe(100 - SIZE);
  });

  it('adds Mario-style horizontal and vertical velocity boost when jumping at speed', () => {
    const wide: Surface = { left: 0, right: 1000, top: 500 };
    // build up running speed on the ground
    const running = run({ ...spawn(100, 500 - SIZE), onGround: true }, [wide], 25, {
      ...idle,
      right: true,
    });
    expect(running.vx).toBeGreaterThan(3);

    // jump while running: launches with higher upward speed and forward momentum in the air
    const jumped = step(running, { ...idle, right: true, jump: true }, [wide], SIZE, VIEW);
    const standingJump = step(
      { ...spawn(100, 500 - SIZE), onGround: true },
      { ...idle, jump: true },
      [wide],
      SIZE,
      VIEW
    );
    expect(jumped.vy).toBeLessThan(standingJump.vy);
    expect(jumped.vx).toBeGreaterThan(running.vx);

    // momentum carries forward in the air even after releasing right
    const glided = run(jumped, [wide], 10, idle);
    expect(glided.x).toBeGreaterThan(jumped.x + 30);
  });

  it('steps down and up across glyph relief segments of the same group', () => {
    const kSeg: Surface = { left: 0, right: 120, top: 300, group: 7 };
    const uSeg: Surface = { left: 120, right: 200, top: 336, group: 7 };
    const lSeg: Surface = { left: 200, right: 320, top: 298, group: 7 };
    const contours = [kSeg, uSeg, lSeg];

    let s: State = { ...spawn(80, 300 - SIZE), onGround: true, jumpsLeft: 1 };
    // walk onto lowercase 'u' segment
    s = run(s, contours, 15, { ...idle, right: true });
    expect(s.onGround).toBe(true);
    expect(s.y).toBe(336 - SIZE);

    // continue walking onto ascender 'l' segment (steps back up)
    s = run(s, contours, 25, { ...idle, right: true });
    expect(s.onGround).toBe(true);
    expect(s.y).toBe(298 - SIZE);
  });

  it('displaces the player to the left when standing on or swept by moving banner words', () => {
    const movingWord: Surface = { left: 50, right: 350, top: 400, bottom: 450, vx: -2 };
    const sOnWord = run(standing(), [movingWord], 10);
    expect(sOnWord.onGround).toBe(true);
    expect(sOnWord.x).toBe(80);

    // player standing on the band floor while a word sweeps through their body
    const bandFloor: Surface = { left: 0, right: 1000, top: 450 };
    const sweepingWord: Surface = { left: 90, right: 300, top: 400, bottom: 450, vx: -2.5 };
    const sSwept = run({ ...spawn(100, 450 - SIZE), onGround: true }, [bandFloor, sweepingWord], 10);
    expect(sSwept.x).toBe(75);
  });

  it('drops through the current floor to the next one', () => {
    const lower: Surface = { left: 0, right: 300, top: 600 };
    const s = run(standing(), [floor, lower], 120, idle, { drop: true });
    expect(s.onGround).toBe(true);
    expect(s.y).toBe(600 - SIZE);
  });

  it('rides a floor that shifts slightly under its feet', () => {
    const risen: Surface = { ...floor, top: floor.top - 10 };
    const s = run(standing(), [risen], 5);
    expect(s.onGround).toBe(true);
    expect(s.y).toBe(risen.top - SIZE);
  });

  it('wraps around the viewport edges', () => {
    const wide: Surface = { left: -Infinity, right: Infinity, top: 400 };
    let s = run({ ...standing(), x: VIEW - SIZE / 2 - 1 }, [wide], 2, { ...idle, right: true });
    expect(s.x).toBeLessThan(0);
    s = run({ ...standing(), x: -SIZE / 2 + 1 }, [wide], 2, { ...idle, left: true });
    expect(s.x).toBeGreaterThan(VIEW - SIZE);
  });
});

describe('collectSurfaces', () => {
  function mockRect(el: Element, left: number, top: number, width: number, height: number) {
    el.getBoundingClientRect = () =>
      ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;
  }

  it('keeps visible text and images, skips chrome, whitespace, narrow and ignored nodes', () => {
    document.body.innerHTML = `
      <div id="root">
        <nav id="nav" style="position: fixed"><a id="navlink">Work</a></nav>
        <h1 id="h1"><span id="first">Stepan</span> <span id="last">Nikulenko</span></h1>
        <p id="p">AI <em id="em">&amp;</em> full-stack</p>
        <span id="narrow">hi</span>
        <div data-climber-ignore><span id="moving">React Native</span></div>
        <img id="img" alt="" />
      </div>`;
    const byId = (id: string) => document.getElementById(id)!;
    mockRect(byId('navlink'), 0, 10, 100, 20);
    mockRect(byId('h1'), 0, 100, 800, 300);
    mockRect(byId('first'), 0, 100, 500, 150);
    mockRect(byId('last'), 0, 250, 800, 150);
    mockRect(byId('p'), 0, 420, 400, 60);
    mockRect(byId('em'), 20, 420, 10, 20);
    mockRect(byId('narrow'), 0, 500, 30, 20);
    mockRect(byId('moving'), 0, 600, 200, 20);
    mockRect(byId('img'), 500, 50, 400, 600);

    const floors = collectSurfaces(byId('root'), SIZE, 0, 1000, 5000);
    expect(floors.map((f) => f.top)).toEqual([1100, 1250, 1420, 1050, 5000]);
    expect(floors[0]).toEqual({ left: 0, right: 500, top: 1100 });
    expect(floors[floors.length - 1]).toEqual({ left: -Infinity, right: Infinity, top: 5000 });
  });

  it('collects component borders, surface bands, chips and eyebrow rules', () => {
    document.body.innerHTML = `
      <div id="root">
        <div id="strip" style="border-top: 1px solid #333"></div>
        <div id="row" style="border-bottom: 1px solid #333"></div>
        <span id="chip" style="border: 1px solid #333">TypeScript</span>
        <div id="eyebrow" class="eyebrow">Selected work</div>
      </div>`;
    const byId = (id: string) => document.getElementById(id)!;
    mockRect(byId('strip'), 0, 200, 800, 80);
    mockRect(byId('row'), 0, 300, 800, 60);
    mockRect(byId('chip'), 50, 400, 120, 32);
    mockRect(byId('eyebrow'), 0, 500, 800, 20);

    const floors = collectSurfaces(byId('root'), SIZE, 0, 0, 2000);
    expect(floors).toEqual([
      { left: 0, right: 800, top: 200 },
      { left: 0, right: 800, top: 359 },
      { left: 50, right: 170, top: 400 },
      { left: 0, right: 800, top: 510 },
      { left: 0, right: 800, top: 500 },
      { left: -Infinity, right: Infinity, top: 2000 },
    ]);
  });
});
