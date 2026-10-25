import { JUMP, type State, type Surface } from './engine';

export type NpcKind = 'seal' | 'ice' | 'bird' | 'bear' | 'pterodactyl';

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
  /** frames remaining before next action or respawn */
  timer: number;
  /** > 0 while knocked out / dying */
  stunned: number;
  /** true while flying off-screen after being killed */
  dying?: boolean;
  /** id of the ice block currently being pushed by this seal */
  carryingId?: number;
}

export interface NpcWorld {
  npcs: Npc[];
  /** true once the climber has latched onto the summit pterodactyl */
  summitCleared: boolean;
  clearTimer: number;
  hurtCooldown: number;
  kills: number;
}

export interface NpcStepEvents {
  playerDied?: { x: number; y: number };
  npcKilled?: { x: number; y: number };
  shattered?: { x: number; y: number };
  summitGrabbed?: { x: number; y: number };
}

let nextNpcId = 1;

/**
 * Spawns Ice Climber NPCs across the measured page platforms:
 * - Seals (Topi) on platforms that patrol and push/drop ice blocks
 * - Polar Bears on wide section ledges
 * - Swooping mountain birds (Nitpicker) across altitude bands
 * - The summit Pterodactyl circling above the highest hero platform
 */
export function createNpcWorld(
  floors: Surface[],
  size: number,
  viewportWidth: number,
  baseTop: number
): NpcWorld {
  const npcs: Npc[] = [];

  // find the highest meaningful text/element floor near the top of the page (the hero title)
  const validFloors = floors.filter(
    (f) => Number.isFinite(f.left) && Number.isFinite(f.right) && f.top > 80 && f.top < baseTop - 80
  );
  const highestTop = validFloors.reduce((min, f) => Math.min(min, f.top), 240);

  // 1. Summit Pterodactyl circling above the hero heading
  const pteroY = Math.max(56, highestTop - size * 2.1);
  npcs.push({
    id: nextNpcId++,
    kind: 'pterodactyl',
    x: viewportWidth * 0.35,
    y: pteroY,
    vx: 2.2,
    vy: 0,
    facing: 1,
    frame: 7,
    scale: 1.5,
    minX: Math.max(24, viewportWidth * 0.08),
    maxX: Math.max(160, viewportWidth * 0.92 - size * 1.5),
    baseY: pteroY,
    phase: 0,
    timer: 0,
    stunned: 0,
  });

  // 2. Seals (Topi) & Polar Bears on platforms spaced vertically down the mountain
  const candidatePlatforms = validFloors
    .filter((f) => f.right - f.left >= size * 2.4 && f.top > highestTop + size * 1.2)
    .sort((a, b) => a.top - b.top);

  const chosenPlatforms: Surface[] = [];
  let lastTop = -Infinity;
  const minGap = Math.max(150, (baseTop - highestTop) / 15);
  for (const p of candidatePlatforms) {
    if (p.top - lastTop >= minGap) {
      chosenPlatforms.push(p);
      lastTop = p.top;
      if (chosenPlatforms.length >= 14) break;
    }
  }

  chosenPlatforms.forEach((p, idx) => {
    const minX = Math.max(0, p.left);
    const maxX = Math.min(viewportWidth - size, p.right - size);
    if (maxX - minX < size * 1.3) return;
    const dir: 1 | -1 = idx % 2 === 0 ? 1 : -1;
    const startX = dir > 0 ? minX + 8 : maxX - 8;
    const isBear = idx % 3 === 1 && maxX - minX >= size * 2.5;
    npcs.push({
      id: nextNpcId++,
      kind: isBear ? 'bear' : 'seal',
      x: startX,
      y: p.top - size,
      vx: dir * (isBear ? 1.05 : 1.4),
      vy: 0,
      facing: dir,
      frame: isBear ? 10 : 2,
      scale: isBear ? 1.12 : 1,
      minX,
      maxX,
      baseY: p.top,
      phase: idx * 1.3,
      timer: 50 + (idx % 5) * 35,
      stunned: 0,
    });
  });

  // 3. Swooping birds (Nitpicker) patrolling across 7 altitude bands
  const span = Math.max(600, baseTop - highestTop);
  const ratios = [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86];
  ratios.forEach((ratio, idx) => {
    const alt = highestTop + span * ratio;
    const dir: 1 | -1 = idx % 2 === 0 ? -1 : 1;
    npcs.push({
      id: nextNpcId++,
      kind: 'bird',
      x: (((idx % 4) + 1) * viewportWidth) / 5,
      y: alt,
      vx: dir * (2.2 + (idx % 3) * 0.35),
      vy: 0,
      facing: dir,
      frame: 5,
      scale: 0.9,
      minX: 16,
      maxX: Math.max(120, viewportWidth - size - 16),
      baseY: alt,
      phase: idx * 1.6,
      timer: 0,
      stunned: 0,
    });
  });

  return {
    npcs,
    summitCleared: false,
    clearTimer: 0,
    hurtCooldown: 0,
    kills: 0,
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
 * Advances all NPCs (seals, bears, ice blocks, birds, summit pterodactyl) and resolves
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
  if (world.hurtCooldown > 0) world.hurtCooldown = Math.max(0, world.hurtCooldown - dt);

  const byId = new Map<number, Npc>();
  for (const n of world.npcs) byId.set(n.id, n);

  const toRemove = new Set<number>();
  const toAdd: Npc[] = [];

  for (const n of world.npcs) {
    n.phase += 0.08 * dt;

    // Killed NPCs fly off in an upside-down arc and respawn on their ledge after a cooldown
    if (n.dying) {
      n.x += n.vx * dt;
      n.vy = Math.min(n.vy + 0.48 * dt, 14);
      n.y += n.vy * dt;
      n.stunned -= dt;
      if (n.stunned <= 0) {
        n.dying = false;
        n.stunned = 0;
        n.x = n.facing > 0 ? n.minX + 8 : n.maxX - 8;
        n.y = n.kind === 'bird' ? n.baseY : n.baseY - size;
        n.vx = n.facing * (n.kind === 'bird' ? 2.4 : n.kind === 'bear' ? 1.05 : 1.4);
        n.vy = 0;
      }
      continue;
    }

    if (n.stunned > 0) {
      n.stunned = Math.max(0, n.stunned - dt);
      continue;
    }

    if (n.kind === 'pterodactyl') {
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

    if (n.kind === 'seal' || n.kind === 'bear') {
      n.x += n.vx * dt;
      const baseFrame = n.kind === 'bear' ? 10 : 2;
      n.frame = Math.floor(n.phase * 2) % 2 === 0 ? baseFrame : baseFrame + 1;

      // spawn an ice block in front of the seal/bear periodically
      if (n.carryingId === undefined) {
        n.timer -= dt;
        if (n.timer <= 0 && n.x > n.minX + size && n.x < n.maxX - size) {
          const iceId = nextNpcId++;
          const iceX = n.x + n.facing * (size * 0.72);
          toAdd.push({
            id: iceId,
            kind: 'ice',
            x: iceX,
            y: n.y,
            vx: n.vx,
            vy: 0,
            facing: n.facing,
            frame: 4,
            scale: 0.75,
            minX: 0,
            maxX: viewportWidth,
            baseY: n.baseY,
            phase: 0,
            timer: 80,
            stunned: 0,
          });
          n.carryingId = iceId;
          n.timer = 210;
        }
      } else {
        const block = byId.get(n.carryingId);
        if (!block || block.timer <= 0 || block.dying) {
          if (block && !block.dying) {
            block.vx = n.facing * 2.6;
          }
          n.carryingId = undefined;
        } else {
          block.x = n.x + n.facing * (size * 0.72);
          block.y = n.y;
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
        (s) => (s.kind === 'seal' || s.kind === 'bear') && !s.dying && s.carryingId === n.id
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

    if (n.kind === 'bird') {
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
      n.y = n.baseY + Math.sin(n.phase * 1.1) * 44;
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

    if (n.kind === 'pterodactyl') {
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
      // 2. Stomp kill from above (jumping onto the head of a seal, bear, or bird)
      if (
        n.kind !== 'ice' &&
        state.vy > 0 &&
        pBottom - state.vy * dt <= nTop + size * 0.48
      ) {
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
