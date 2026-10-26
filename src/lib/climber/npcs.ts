import { JUMP, type State, type Surface } from './engine';

export type NpcKind = 'bug' | 'ice' | 'moth' | 'golem' | 'wyrm';

export interface Npc {
  id: number;
  kind: NpcKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  /** sprite frame index on the shared sheet */
  frame: number;
  /** scale multiplier relative to base sprite size */
  scale: number;
  /** patrol bounds or home altitude */
  minX: number;
  maxX: number;
  baseY: number;
  phase: number;
  /** frames remaining before next ice block / dive / special action */
  timer: number;
  /** frames remaining before next spontaneous behavior change (hop, dash, turn, swoop) */
  actionTimer?: number;
  /** > 0 while knocked out / dying */
  stunned: number;
  /** true while flying off-screen after being killed */
  dying?: boolean;
  /** id of the ice block currently being pushed by this bug */
  carryingId?: number;
}

export interface NpcWorld {
  npcs: Npc[];
  /** true once the climber has latched onto the summit wyrm */
  summitCleared: boolean;
  clearTimer: number;
  hurtCooldown: number;
  kills: number;
  /** countdown until next dynamic reinforcement spawn near the climber */
  spawnCooldown: number;
  rng: () => number;
}

export interface NpcStepEvents {
  playerDied?: { x: number; y: number };
  npcKilled?: { x: number; y: number };
  shattered?: { x: number; y: number };
  summitGrabbed?: { x: number; y: number };
}

let nextNpcId = 1;

const randRange = (rng: () => number, min: number, max: number) => min + rng() * (max - min);

/**
 * Spawns enemy NPCs across the measured page platforms with randomized positions,
 * speeds, directions, and action timers:
 * - Bugs on platforms that patrol, scurry, hop, and push/kick ice blocks
 * - Ice Golems on wide section ledges that hop-stomp, charge, and toss ice
 * - Swooping mountain moths that patrol and dive toward the climber
 * - The summit Wyrm circling above the highest hero platform
 */
export function createNpcWorld(
  floors: Surface[],
  size: number,
  viewportWidth: number,
  baseTop: number,
  rng: () => number = Math.random
): NpcWorld {
  const npcs: Npc[] = [];

  // find the highest meaningful text/element floor near the top of the page (the hero title)
  const validFloors = floors.filter(
    (f) => Number.isFinite(f.left) && Number.isFinite(f.right) && f.top > 80 && f.top < baseTop - 80
  );
  const highestTop = validFloors.reduce((min, f) => Math.min(min, f.top), 240);

  // 1. Summit Wyrm circling above the hero heading
  const wyrmY = Math.max(56, highestTop - size * 2.1);
  const wyrmDir: 1 | -1 = rng() < 0.5 ? 1 : -1;
  npcs.push({
    id: nextNpcId++,
    kind: 'wyrm',
    x: randRange(rng, viewportWidth * 0.2, viewportWidth * 0.7),
    y: wyrmY,
    vx: wyrmDir * randRange(rng, 2.0, 2.6),
    vy: 0,
    facing: wyrmDir,
    frame: 7,
    scale: 1.5,
    minX: Math.max(24, viewportWidth * 0.08),
    maxX: Math.max(160, viewportWidth * 0.92 - size * 1.5),
    baseY: wyrmY,
    phase: randRange(rng, 0, Math.PI * 2),
    timer: 0,
    stunned: 0,
  });

  // 2. Bugs & Ice Golems on platforms spaced vertically down the mountain
  const candidatePlatforms = validFloors
    .filter((f) => f.right - f.left >= size * 2.4 && f.top > highestTop + size * 1.2)
    .sort((a, b) => a.top - b.top);

  const chosenPlatforms: Surface[] = [];
  let lastTop = -Infinity;
  const baseGap = Math.max(135, (baseTop - highestTop) / 16);
  for (const p of candidatePlatforms) {
    const gap = baseGap * randRange(rng, 0.75, 1.2);
    if (p.top - lastTop >= gap) {
      chosenPlatforms.push(p);
      lastTop = p.top;
      if (chosenPlatforms.length >= 15) break;
    }
  }

  let hasBug = false;
  let hasGolem = false;
  chosenPlatforms.forEach((p, idx) => {
    const minX = Math.max(0, p.left);
    const maxX = Math.min(viewportWidth - size, p.right - size);
    if (maxX - minX < size * 1.3) return;
    const dir: 1 | -1 = rng() < 0.5 ? 1 : -1;
    const startX = randRange(
      rng,
      minX + Math.min(size * 0.65, (maxX - minX) * 0.25),
      Math.max(minX + 8, maxX - Math.min(size * 0.65, (maxX - minX) * 0.25))
    );
    const wideEnoughForGolem = maxX - minX >= size * 2.5;
    let isGolem = wideEnoughForGolem && rng() < 0.38;
    if (idx === 0 && hasBug) isGolem = wideEnoughForGolem;
    if (!hasGolem && idx === chosenPlatforms.length - 1 && wideEnoughForGolem) isGolem = true;
    if (!hasBug && idx === chosenPlatforms.length - 1 && isGolem && chosenPlatforms.length > 1) {
      // keep at least one bug and one golem when multiple platforms exist
    } else if (!hasBug && idx === 0) {
      isGolem = false;
    }
    if (isGolem) hasGolem = true;
    else hasBug = true;

    const speed = isGolem ? randRange(rng, 0.9, 1.45) : randRange(rng, 1.2, 1.95);
    npcs.push({
      id: nextNpcId++,
      kind: isGolem ? 'golem' : 'bug',
      x: startX,
      y: p.top - size,
      vx: dir * speed,
      vy: 0,
      facing: dir,
      frame: isGolem ? 10 : 2,
      scale: isGolem ? 1.12 : 1,
      minX,
      maxX,
      baseY: p.top,
      phase: randRange(rng, 0, Math.PI * 2),
      timer: idx === 0 ? Math.round(randRange(rng, 20, 48)) : Math.round(randRange(rng, 30, 125)),
      actionTimer: Math.round(randRange(rng, 45, 140)),
      stunned: 0,
    });
  });

  // 3. Swooping moths patrolling across randomized altitude bands
  const span = Math.max(600, baseTop - highestTop);
  const baseRatios = [0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.85];
  baseRatios.forEach((ratio) => {
    const jitteredRatio = Math.min(0.92, Math.max(0.08, ratio + randRange(rng, -0.04, 0.04)));
    const alt = highestTop + span * jitteredRatio;
    const dir: 1 | -1 = rng() < 0.5 ? -1 : 1;
    const minX = 16;
    const maxX = Math.max(120, viewportWidth - size - 16);
    npcs.push({
      id: nextNpcId++,
      kind: 'moth',
      x: randRange(rng, minX, maxX),
      y: alt,
      vx: dir * randRange(rng, 2.0, 3.4),
      vy: 0,
      facing: dir,
      frame: 5,
      scale: 0.9,
      minX,
      maxX,
      baseY: alt,
      phase: randRange(rng, 0, Math.PI * 2),
      timer: Math.round(randRange(rng, 40, 140)),
      actionTimer: Math.round(randRange(rng, 50, 120)),
      stunned: 0,
    });
  });

  return {
    npcs,
    summitCleared: false,
    clearTimer: 0,
    hurtCooldown: 0,
    kills: 0,
    spawnCooldown: Math.round(randRange(rng, 140, 240)),
    rng,
  };
}

/** Dynamic walkable surfaces offered by active ice blocks. */
export function iceBlockSurfaces(world: NpcWorld, size: number): Surface[] {
  const out: Surface[] = [];
  for (const n of world.npcs) {
    if (n.kind !== 'ice') continue;
    const blockSize = size * n.scale;
    const topOffset = size - blockSize;
    out.push({
      left: n.x + topOffset / 2,
      right: n.x + topOffset / 2 + blockSize,
      top: n.y + topOffset,
      bottom: n.y + size,
      vx: n.vx,
    });
  }
  return out;
}

function killNpc(n: Npc, pushDir: 1 | -1, world: NpcWorld, toRemove: Set<number>): void {
  world.kills += 1;
  if (n.kind === 'ice') {
    toRemove.add(n.id);
    return;
  }
  n.dying = true;
  n.stunned = 360;
  n.vx = pushDir * 3.6;
  n.vy = -7.5;
  n.carryingId = undefined;
}

/**
 * Advances all NPCs (bugs, golems, ice blocks, moths, summit wyrm) and resolves
 * combat and hazard collisions with the climber.
 */
export function stepNpcs(
  world: NpcWorld,
  state: State,
  floors: Surface[],
  size: number,
  viewportWidth: number,
  baseTop: number,
  dt = 1,
  attacking = false
): NpcStepEvents {
  const events: NpcStepEvents = {};
  const rng = world.rng ?? Math.random;
  if (world.hurtCooldown > 0) world.hurtCooldown = Math.max(0, world.hurtCooldown - dt);

  const byId = new Map<number, Npc>();
  for (const n of world.npcs) byId.set(n.id, n);

  const toRemove = new Set<number>();
  const toAdd: Npc[] = [];

  // Dynamic reinforcement spawns near the climber's current altitude
  if (!world.summitCleared) {
    world.spawnCooldown = (world.spawnCooldown ?? 180) - dt;
    const activeEnemies = world.npcs.filter((n) => !n.dying && n.kind !== 'wyrm').length;
    if (world.spawnCooldown <= 0 && activeEnemies < 26) {
      world.spawnCooldown = Math.round(randRange(rng, 140, 260));
      const fromLeft = rng() < 0.5;
      const dir: 1 | -1 = fromLeft ? 1 : -1;

      if (rng() < 0.45) {
        // Spawn a surprise swooping moth entering near the player's height
        const alt = Math.max(
          90,
          Math.min(baseTop - size * 2, state.y + randRange(rng, -size * 3.5, size * 2))
        );
        const minX = 16;
        const maxX = Math.max(120, viewportWidth - size - 16);
        toAdd.push({
          id: nextNpcId++,
          kind: 'moth',
          x: fromLeft ? minX : maxX,
          y: alt,
          vx: dir * randRange(rng, 2.2, 3.6),
          vy: 0,
          facing: dir,
          frame: 5,
          scale: 0.9,
          minX,
          maxX,
          baseY: alt,
          phase: randRange(rng, 0, Math.PI * 2),
          timer: Math.round(randRange(rng, 35, 110)),
          actionTimer: Math.round(randRange(rng, 40, 100)),
          stunned: 0,
        });
      } else {
        // Spawn a bug or ice golem on a nearby platform that isn't overcrowded
        const nearbyPlatforms = floors.filter(
          (f) =>
            Number.isFinite(f.left) &&
            Number.isFinite(f.right) &&
            f.right - f.left >= size * 2.4 &&
            f.top > 120 &&
            f.top < baseTop - 80 &&
            Math.abs(f.top - (state.y + size)) < size * 8
        );
        if (nearbyPlatforms.length > 0) {
          const p = nearbyPlatforms[Math.floor(rng() * nearbyPlatforms.length)];
          const minX = Math.max(0, p.left);
          const maxX = Math.min(viewportWidth - size, p.right - size);
          const crowded = world.npcs.some(
            (n) =>
              (n.kind === 'bug' || n.kind === 'golem') && !n.dying && Math.abs(n.baseY - p.top) < 16
          );
          if (!crowded && maxX - minX >= size * 1.4) {
            const isGolem = maxX - minX >= size * 2.5 && rng() < 0.42;
            const speed = isGolem ? randRange(rng, 0.95, 1.55) : randRange(rng, 1.3, 2.1);
            toAdd.push({
              id: nextNpcId++,
              kind: isGolem ? 'golem' : 'bug',
              x: fromLeft ? minX + 6 : maxX - 6,
              y: p.top - size,
              vx: dir * speed,
              vy: 0,
              facing: dir,
              frame: isGolem ? 10 : 2,
              scale: isGolem ? 1.12 : 1,
              minX,
              maxX,
              baseY: p.top,
              phase: randRange(rng, 0, Math.PI * 2),
              timer: Math.round(randRange(rng, 30, 110)),
              actionTimer: Math.round(randRange(rng, 45, 120)),
              stunned: 0,
            });
          }
        }
      }
    }
  }

  for (const n of world.npcs) {
    n.phase += 0.08 * dt;

    // Killed NPCs fly off in an upside-down arc and respawn with randomized attributes
    if (n.dying) {
      n.x += n.vx * dt;
      n.vy = Math.min(n.vy + 0.48 * dt, 14);
      n.y += n.vy * dt;
      n.stunned -= dt;
      if (n.stunned <= 0) {
        n.dying = false;
        n.stunned = 0;
        const dir: 1 | -1 = rng() < 0.5 ? 1 : -1;
        n.facing = dir;
        if (n.kind === 'bug' || n.kind === 'golem') {
          if (n.maxX - n.minX >= size * 2.5 && rng() < 0.35) {
            n.kind = n.kind === 'bug' ? 'golem' : 'bug';
            n.scale = n.kind === 'golem' ? 1.12 : 1;
          }
        }
        n.x = dir > 0 ? n.minX + 8 : n.maxX - 8;
        n.y = n.kind === 'moth' ? n.baseY : n.baseY - size;
        const speed =
          n.kind === 'moth'
            ? randRange(rng, 2.0, 3.4)
            : n.kind === 'golem'
              ? randRange(rng, 0.95, 1.5)
              : randRange(rng, 1.25, 2.0);
        n.vx = dir * speed;
        n.vy = 0;
        n.timer = Math.round(randRange(rng, 40, 140));
        n.actionTimer = Math.round(randRange(rng, 45, 130));
      }
      continue;
    }

    if (n.stunned > 0) {
      n.stunned = Math.max(0, n.stunned - dt);
      continue;
    }

    if (n.kind === 'wyrm') {
      if (world.summitCleared) {
        world.clearTimer += dt;
        n.x += n.facing * 2.8 * dt;
        if (n.x > n.maxX) {
          n.x = n.maxX;
          n.facing = -1;
        } else if (n.x < n.minX) {
          n.x = n.minX;
          n.facing = 1;
        }
        n.y = n.baseY - Math.min(world.clearTimer * 0.4, 36) + Math.sin(n.phase * 1.4) * 8;
        n.frame = Math.floor(n.phase * 2) % 2 === 0 ? 7 : 8;
        state.x = n.x + (size * (n.scale - 1)) / 2;
        state.y = n.y + size * 0.62;
        state.vx = 0;
        state.vy = 0;
        state.onGround = false;
        state.facing = n.facing;
        continue;
      }

      n.x += n.vx * dt;
      if (n.x >= n.maxX) {
        n.x = n.maxX;
        n.vx = -Math.abs(n.vx);
        n.facing = -1;
      } else if (n.x <= n.minX) {
        n.x = n.minX;
        n.vx = Math.abs(n.vx);
        n.facing = 1;
      }
      n.y = n.baseY + Math.sin(n.phase * 1.2) * 10;
      n.frame = Math.floor(n.phase * 1.8) % 2 === 0 ? 7 : 8;
      continue;
    }

    if (n.kind === 'bug' || n.kind === 'golem') {
      n.x += n.vx * dt;
      // Vertical hop physics on the platform (for golem ground-pound leaps or bug hops)
      const groundY = n.baseY - size;
      if (n.y < groundY || n.vy !== 0) {
        n.vy = Math.min(n.vy + 0.45 * dt, 10);
        n.y += n.vy * dt;
        if (n.y >= groundY) {
          n.y = groundY;
          n.vy = 0;
        }
      }

      const baseFrame = n.kind === 'golem' ? 10 : 2;
      n.frame = Math.floor(n.phase * 2) % 2 === 0 ? baseFrame : baseFrame + 1;

      // Spontaneous randomized actions: hop, dash, or turn toward the climber
      n.actionTimer = (n.actionTimer ?? 80) - dt;
      if (n.actionTimer <= 0 && n.carryingId === undefined) {
        n.actionTimer = Math.round(randRange(rng, 55, 145));
        const roll = rng();
        if (n.kind === 'golem' && roll < 0.42 && n.y >= groundY) {
          // Ice golem jump-stomp + speed surge
          n.vy = -randRange(rng, 5.4, 7.0);
          n.vx = n.facing * randRange(rng, 1.35, 2.05);
        } else if (n.kind === 'bug' && roll < 0.3 && n.y >= groundY) {
          // Little bug hop
          n.vy = -randRange(rng, 4.0, 5.2);
        } else if (roll < 0.65) {
          // Sudden direction reversal or turn toward the player if nearby
          const nearPlayerY = Math.abs(state.y - n.y) < size * 2.5;
          const dir: 1 | -1 = nearPlayerY ? (state.x >= n.x ? 1 : -1) : (-n.facing as 1 | -1);
          n.facing = dir;
          const baseSpeed =
            n.kind === 'golem' ? randRange(rng, 0.95, 1.6) : randRange(rng, 1.25, 2.2);
          n.vx = dir * baseSpeed;
        } else {
          // Speed dash along current direction
          const dashSpeed =
            n.kind === 'golem' ? randRange(rng, 1.5, 2.2) : randRange(rng, 1.9, 2.75);
          n.vx = n.facing * dashSpeed;
        }
      }

      // Spawn an ice block in front of the bug/golem at randomized intervals
      if (n.carryingId === undefined) {
        n.timer -= dt;
        if (n.timer <= 0 && n.x > n.minX + size * 0.6 && n.x < n.maxX - size * 0.6) {
          const iceId = nextNpcId++;
          const iceX = n.x + n.facing * (size * 0.72);
          toAdd.push({
            id: iceId,
            kind: 'ice',
            x: iceX,
            y: groundY,
            vx: n.vx,
            vy: 0,
            facing: n.facing,
            frame: 4,
            scale: 0.75,
            minX: 0,
            maxX: viewportWidth,
            baseY: n.baseY,
            phase: 0,
            timer: Math.round(randRange(rng, 45, 105)),
            stunned: 0,
          });
          n.carryingId = iceId;
          n.timer = Math.round(randRange(rng, 120, 230));
        }
      } else {
        const block = byId.get(n.carryingId);
        if (!block || block.timer <= 0 || block.dying) {
          if (block && !block.dying) {
            block.vx = n.facing * randRange(rng, 2.2, 3.6);
          }
          n.carryingId = undefined;
        } else {
          block.x = n.x + n.facing * (size * 0.72);
          block.y = groundY;
          block.vx = n.vx;
          block.timer -= dt;
        }
      }

      if (n.x >= n.maxX) {
        n.x = n.maxX;
        n.vx = -Math.abs(n.vx);
        n.facing = -1;
        n.carryingId = undefined;
      } else if (n.x <= n.minX) {
        n.x = n.minX;
        n.vx = Math.abs(n.vx);
        n.facing = 1;
        n.carryingId = undefined;
      }
      continue;
    }

    if (n.kind === 'ice') {
      const isHeld = world.npcs.some(
        (s) => (s.kind === 'bug' || s.kind === 'golem') && !s.dying && s.carryingId === n.id
      );
      if (!isHeld) {
        const feetBefore = n.y + size;
        n.x += n.vx * dt;
        const cx = n.x + size / 2;
        const support = floors.find(
          (f) => Math.abs(f.top - feetBefore) <= 10 && cx >= f.left && cx <= f.right
        );
        if (support) {
          n.y = support.top - size;
          n.vy = 0;
        } else {
          n.vy = Math.min(n.vy + 0.45 * dt, 12);
          n.y += n.vy * dt;
          const feetAfter = n.y + size;
          for (const f of floors) {
            if (f.top >= feetBefore && f.top <= feetAfter && cx >= f.left && cx <= f.right) {
              n.y = f.top - size;
              n.vy = 0;
              break;
            }
          }
        }
        if (n.x < -size || n.x > viewportWidth + size || n.y + size >= baseTop || n.phase > 28) {
          toRemove.add(n.id);
          events.shattered = { x: n.x + size / 2, y: n.y + size / 2 };
        }
      }
      continue;
    }

    if (n.kind === 'moth') {
      // Spontaneous moth behaviors: dive toward player altitude, reverse, or speed up
      n.actionTimer = (n.actionTimer ?? 70) - dt;
      if (n.actionTimer <= 0) {
        n.actionTimer = Math.round(randRange(rng, 45, 115));
        const vertDist = state.y - n.baseY;
        if (Math.abs(vertDist) < size * 8 && rng() < 0.65) {
          // Swoop toward the climber's altitude and direction
          n.baseY = Math.max(
            90,
            Math.min(baseTop - size * 2, n.baseY + Math.sign(vertDist) * randRange(rng, 28, 72))
          );
          const dir: 1 | -1 = state.x >= n.x ? 1 : -1;
          n.facing = dir;
          n.vx = dir * randRange(rng, 2.5, 3.8);
        } else {
          // Random altitude drift and speed change
          n.baseY = Math.max(90, Math.min(baseTop - size * 2, n.baseY + randRange(rng, -55, 55)));
          if (rng() < 0.35) n.facing = -n.facing as 1 | -1;
          n.vx = n.facing * randRange(rng, 2.0, 3.4);
        }
      }

      n.x += n.vx * dt;
      if (n.x >= n.maxX) {
        n.x = n.maxX;
        n.vx = -Math.abs(n.vx);
        n.facing = -1;
      } else if (n.x <= n.minX) {
        n.x = n.minX;
        n.vx = Math.abs(n.vx);
        n.facing = 1;
      }
      n.y = n.baseY + Math.sin(n.phase * 1.25) * 46;
      n.frame = Math.floor(n.phase * 2.4) % 2 === 0 ? 5 : 6;
    }
  }

  if (world.summitCleared) return events;

  // Player body & hammer hitboxes
  const pLeft = state.x + size * 0.2;
  const pRight = state.x + size * 0.8;
  const pTop = state.y + size * 0.1;
  const pBottom = state.y + size;
  const pCenterX = state.x + size / 2;

  const hLeft = state.facing > 0 ? state.x + size * 0.25 : state.x - size * 0.55;
  const hRight = state.facing > 0 ? state.x + size * 1.55 : state.x + size * 0.75;
  const hTop = state.y - size * 0.25;
  const hBottom = state.y + size * 1.05;

  for (const n of world.npcs) {
    if (n.dying || n.stunned > 0 || toRemove.has(n.id)) continue;

    if (n.kind === 'wyrm') {
      const w = size * n.scale;
      const nLeft = n.x - (w - size) / 2;
      const nRight = nLeft + w;
      const nTop = n.y;
      const nBottom = n.y + size * 1.1;
      if (pRight > nLeft && pLeft < nRight && pBottom > nTop && pTop < nBottom) {
        world.summitCleared = true;
        world.clearTimer = 0;
        events.summitGrabbed = { x: pCenterX, y: state.y + size / 2 };
        break;
      }
      continue;
    }

    const inset = n.kind === 'ice' ? 0.22 : 0.18;
    const topInset = n.kind === 'ice' ? 0.25 : 0.2;
    const nLeft = n.x + size * inset;
    const nRight = n.x + size * (1 - inset);
    const nTop = n.y + size * topInset;
    const nBottom = n.y + size;

    // 1. Hammer swing kill
    if (attacking && hRight > nLeft && hLeft < nRight && hBottom > nTop && hTop < nBottom) {
      killNpc(n, state.facing, world, toRemove);
      events.npcKilled = { x: n.x + size / 2, y: n.y + size / 2 };
      continue;
    }

    if (pRight > nLeft && pLeft < nRight && pBottom > nTop && pTop < nBottom) {
      // 2. Stomp kill from above (jumping onto the head of a bug, golem, or moth)
      if (n.kind !== 'ice' && state.vy > 0 && pBottom - state.vy * dt <= nTop + size * 0.48) {
        killNpc(n, state.facing, world, toRemove);
        state.vy = JUMP * 0.88;
        state.onGround = false;
        state.jumpsLeft = 1;
        events.npcKilled = { x: n.x + size / 2, y: nTop };
        continue;
      }

      // 3. Under-strike kill when jumping up from beneath an enemy's platform
      if (state.vy < -2 && pTop - state.vy * dt >= nBottom - size * 0.35) {
        killNpc(n, state.facing, world, toRemove);
        events.npcKilled = { x: n.x + size / 2, y: nBottom };
        continue;
      }

      // 4. Otherwise: 1-life hazard collision resets the player to the bottom platform
      if (world.hurtCooldown <= 0) {
        events.playerDied = { x: pCenterX, y: state.y + size / 2 };
        world.hurtCooldown = 60;
        if (n.kind === 'ice') {
          toRemove.add(n.id);
        }
        break;
      }
    }
  }

  if (toRemove.size > 0 || toAdd.length > 0) {
    world.npcs = world.npcs.filter((n) => !toRemove.has(n.id)).concat(toAdd);
  }

  return events;
}
