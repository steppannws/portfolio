import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import type { State } from './engine';

export interface Renderer {
  canvas: HTMLCanvasElement;
  burst(x: number, y: number, kind: 'pop' | 'land' | 'jump'): void;
  draw(state: State, scrollX: number, scrollY: number, frame: number, dt?: number, intro?: boolean): void;
  dispose(): void;
}

interface Particle {
  mesh: Mesh<PlaneGeometry, MeshBasicMaterial>;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  life: number;
  maxLife: number;
  w: number;
  h: number;
}

/**
 * Transparent WebGL overlay with a camera mapped 1:1 to CSS pixels (origin top-left,
 * page y negated into world y). The sprite is one plane cut from a horizontal sheet.
 */
export function createRenderer(sheet: HTMLCanvasElement, frames: number, size: number): Renderer {
  const renderer = new WebGLRenderer({ alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;

  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, -1, -10, 10);

  const texture = new CanvasTexture(sheet);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  texture.repeat.set(1 / frames, 1);

  const material = new MeshBasicMaterial({ map: texture, transparent: true });
  const geometry = new PlaneGeometry(size, size);
  const mesh = new Mesh(geometry, material);
  mesh.position.z = 1;
  scene.add(mesh);

  // two motion-trail ghost sprites visible during the high-speed intro descent
  const trailMaterials = [0.34, 0.16].map(
    (opacity) => new MeshBasicMaterial({ map: texture, transparent: true, opacity })
  );
  const trails = trailMaterials.map((mat) => {
    const m = new Mesh(geometry, mat);
    m.visible = false;
    scene.add(m);
    return m;
  });

  // pooled 1x1 pixel plane shared by burst particles and wind streaks
  const unitGeo = new PlaneGeometry(1, 1);
  const particles: Particle[] = [];
  let squash = 0;
  let windCooldown = 0;

  const spawnParticle = (
    x: number,
    y: number,
    vx: number,
    vy: number,
    gravity: number,
    life: number,
    w: number,
    h: number,
    color: number
  ) => {
    const mat = new MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const pMesh = new Mesh(unitGeo, mat);
    pMesh.scale.set(w, h, 1);
    scene.add(pMesh);
    particles.push({ mesh: pMesh, x, y, vx, vy, gravity, life, maxLife: life, w, h });
  };

  const burst = (x: number, y: number, kind: 'pop' | 'land' | 'jump') => {
    const px = Math.max(3, Math.round(size / 14));
    if (kind === 'pop') {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.2;
        const speed = 2.8 + (i % 3) * 1.4;
        const color = i % 2 === 0 ? 0xdd4318 : 0xe9e5db;
        spawnParticle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - 1.5,
          0.22,
          22 + (i % 3) * 5,
          px,
          px,
          color
        );
      }
    } else if (kind === 'land') {
      squash = 1;
      for (let i = 0; i < 14; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const spread = 1.2 + Math.floor(i / 2) * 0.75;
        const vy = -1.6 - (i % 4) * 0.85;
        const color = i % 3 === 0 ? 0xdd4318 : i % 2 === 0 ? 0xe9e5db : 0x9a978f;
        spawnParticle(x + side * 6, y - 2, side * spread, vy, 0.2, 20 + (i % 4) * 4, px, px, color);
      }
    } else if (kind === 'jump') {
      for (let i = 0; i < 6; i++) {
        const side = i - 2.5;
        spawnParticle(x + side * 4, y, side * 0.9, 1.2 + (i % 2) * 0.6, 0.1, 14, px, px, 0xe9e5db);
      }
    }
  };

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.right = window.innerWidth;
    camera.bottom = -window.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  return {
    canvas,
    burst,
    draw(state, scrollX, scrollY, frame, dt = 1, intro = false) {
      texture.offset.x = frame / frames;
      // whole pixels keep the nearest-filtered sprite crisp
      const x = Math.round(state.x - scrollX) + size / 2;
      const y = Math.round(state.y - scrollY) + size / 2;

      if (squash > 0) {
        squash = Math.max(0, squash - 0.1 * dt);
      }
      const sy = 1 - squash * 0.24;
      const sx = 1 + squash * 0.2;
      mesh.position.set(x, -(y + (1 - sy) * (size / 2)), 1);
      mesh.scale.set(state.facing * sx, sy, 1);

      // afterimage trail and wind streaks during the fast intro fall
      const showTrail = intro && state.vy > 14;
      trails.forEach((t, idx) => {
        t.visible = showTrail;
        if (showTrail) {
          const lag = (idx + 1) * Math.min(state.vy * 0.55, 28);
          t.position.set(x, -(y - lag), 0);
          t.scale.set(state.facing, 1, 1);
        }
      });

      if (showTrail) {
        windCooldown -= dt;
        if (windCooldown <= 0) {
          windCooldown = 2;
          const side = Math.random() > 0.5 ? 1 : -1;
          const offsetX = side * (size * 0.45 + Math.random() * size * 0.8);
          const color = Math.random() > 0.25 ? 0xe9e5db : 0xdd4318;
          spawnParticle(
            state.x + size / 2 + offsetX,
            state.y + size,
            0,
            -state.vy * 0.35,
            0,
            10,
            2,
            16,
            color
          );
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.gravity * dt;
        p.life -= dt;
        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.material.dispose();
          particles.splice(i, 1);
          continue;
        }
        p.mesh.material.opacity = Math.min(1, p.life / (p.maxLife * 0.4));
        p.mesh.position.set(Math.round(p.x - scrollX), -Math.round(p.y - scrollY), 0.5);
      }

      renderer.render(scene, camera);
    },
    dispose() {
      window.removeEventListener('resize', resize);
      for (const p of particles) {
        scene.remove(p.mesh);
        p.mesh.material.dispose();
      }
      particles.length = 0;
      for (const mat of trailMaterials) mat.dispose();
      unitGeo.dispose();
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
