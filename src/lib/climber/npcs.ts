import { JUMP, type State, type Surface } from './engine';

export type NpcKind = 'seal' | 'ice' | 'bird' | 'pterodactyl';

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
  /** frames remaining before a stunned seal/bird recovers, or before a seal spawns its next ice block */
  timer: number;
  stunned: number;
  /** id of the ice block currently being pushed by this seal */
  carryingId?: number;
}

export interface NpcWorld {
  npcs: Npc[];
  /** true once the climber has latched onto the summit pterodactyl */
  summitCleared: boolean;
  clearTimer: number;
  hurtCooldown: number;
}

export interface NpcStepEvents {
  stomped?: { x: number; y: number };
  bumped?: { x: number; y: number };
  shattered?: { x: number; y: number };
  summitGrabbed?: { x: number; y: number };
}

let nextNpcId = 1;

/**
 * Spawns Ice Climber NPCs across the measured page platforms:
 * - Seals (Topi) on wide platforms that patrol and push/drop ice blocks
 * - Swooping mountain birds (Nitpicker) at mid/upper altitudes
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

  // 2. Seals (Topi) on wide platforms spaced vertically down the mountain
  const sealPlatforms = validFloors
    .filter((f) => f.right - f.left >= size * 3.2 && f.top > highestTop + size * 1.5)
    .sort((a, b) => a.top - b.top);

  const chosenPlatforms: Surface[] = [];
  let lastTop = -Infinity;
  for (const p of sealPlatforms) {
    if (p.top - lastTop >= Math.max(260, (baseTop - highestTop) / 6)) {
      chosenPlatforms.push(p);
      lastTop = p.top;
      if (chosenPlatforms.length >= 5) break;
    }
  }

  chosenPlatforms.forEach((p, idx) => {
    const minX = Math.max(0, p.left);
    const maxX = Math.min(viewportWidth - size, p.right - size);
    if (maxX - minX < size * 1.5) return;
    const dir: 1 | -1 = idx % 2 === 0 ? 1 : -1;
    const startX = dir > 0 ? minX + 8 : maxX - 8;
    npcs.push({
      id: nextNpcId++,
      kind: 'seal',
      x: startX,
      y: p.top - size,
      vx: dir * 1.35,
      vy: 0,
      facing: dir,
      frame: 2,
      scale: 1,
      minX,
      maxX,
      baseY: p.top,
      phase: idx * 1.7,
      // stagger when each seal pushes out an ice block
      timer: 60 + idx * 45,
      stunned: 0,
    });
  });

  // 3. Swooping birds (Nitpicker) patrolling across 3 altitude bands
  const span = Math.max(600, baseTop - highestTop);
  const birdAltitudes = [highestTop + span * 0.25, highestTop + span * 0.52, highestTop + span * 0.78];
  birdAltitudes.forEach((alt, idx) => {
    const dir: 1 | -1 = idx % 2 === 0 ? -1 : 1;
    npcs.push({
      id: nextNpcId++,
      kind: 'bird',
      x: ((idx + 1) * viewportWidth) / 4,
      y: alt,
      vx: dir * 2.4,
      vy: 0,
      facing: dir,
      frame: 5,
      scale: 0.9,
      minX: 16,
      maxX: Math.max(120, viewportWidth - size - 16),
      baseY: alt,
      phase: idx * 2.1,
      timer: 0,
      stunned: 0,
    });
  });

  return {
    npcs,
    summitCleared: false,
    clearTimer: 0,
    hurtCooldown: 0,
  };
}

/** Dynamic walkable surfaces offered by active ice blocks so the climber can stand on them. */
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

/**
 * Advances all NPCs (seals, ice blocks, birds, summit pterodactyl) and resolves
 * interactions with the climber.
 */
export function stepNpcs(
  world: NpcWorld,
  state: State,
  floors: Surface[],
  size: number,
  viewportWidth: number,
  baseTop: number,
  dt = 1
): NpcStepEvents {
  const events: NpcStepEvents = {};
  if (world.hurtCooldown > 0) world.hurtCooldown = Math.max(0, world.hurtCooldown - dt);

  const byId = new Map<number, Npc>();
  for (const n of world.npcs) byId.set(n.id, n);

  const toRemove = new Set<number>();
  const toAdd: Npc[] = [];

  for (const n of world.npcs) {
    n.phase += 0.08 * dt;

    if (n.stunned > 0) {
      n.stunned = Math.max(0, n.stunned - dt);
      continue;
    }

    if (n.kind === 'pterodactyl') {
      if (world.summitCleared) {
        // victory flight: soar upward and across the summit sky carrying the climber
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
        // lock the climber to the pterodactyl's talons
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

    if (n.kind === 'seal') {
      n.x += n.vx * dt;
      n.frame = Math.floor(n.phase * 2) % 2 === 0 ? 2 : 3;

      // spawn an ice block in front of the seal periodically
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
            // seal pushes the block for ~85 frames, then releases it to slide and drop
            timer: 85,
            stunned: 0,
          });
          n.carryingId = iceId;
          n.timer = 240;
        }
      } else {
        const block = byId.get(n.carryingId);
        if (!block || block.timer <= 0) {
          if (block) {
            // release the ice block so it slides faster on its own and drops off the ledge
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
      // if no longer held by a seal, slide and fall under gravity across floors
      const isHeld = world.npcs.some((s) => s.kind === 'seal' && s.carryingId === n.id);
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
        n.stunned -= dt;
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

  if (toRemove.size > 0 || toAdd.length > 0) {
    world.npcs = world.npcs.filter((n) => !toRemove.has(n.id)).concat(toAdd);
  }

  if (world.summitCleared) return events;

  // Player <-> NPC collisions
  const pLeft = state.x + size * 0.2;
  const pRight = state.x + size * 0.8;
  const pTop = state.y + size * 0.1;
  const pBottom = state.y + size;
  const pCenterX = state.x + size / 2;

  for (const n of world.npcs) {
    if (n.stunned > 0 || n.kind === 'ice') continue;

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

    const nLeft = n.x + size * 0.18;
    const nRight = n.x + size * 0.82;
    const nTop = n.y + size * 0.2;
    const nBottom = n.y + size;

    if (pRight > nLeft && pLeft < nRight && pBottom > nTop && pTop < nBottom) {
      // Stomp from above: bounce the player upward and stun the seal/bird
      if (state.vy > 0 && pBottom - state.vy * dt <= nTop + size * 0.45) {
        state.vy = JUMP * 0.92;
        state.onGround = false;
        state.jumpsLeft = 1;
        n.stunned = 120;
        events.stomped = { x: n.x + size / 2, y: nTop };
      } else if (world.hurtCooldown <= 0) {
        // Side bump: playful arcade knockback
        const pushDir = pCenterX < n.x + size / 2 ? -1 : 1;
        state.vx = pushDir * 4.2;
        state.vy = -5.5;
        state.onGround = false;
        world.hurtCooldown = 45;
        events.bumped = { x: pCenterX, y: state.y + size / 2 };
      }
    }
  }

  return events;
}
