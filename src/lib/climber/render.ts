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
  draw(state: State, scrollX: number, scrollY: number, frame: number): void;
  dispose(): void;
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
  scene.add(mesh);

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
    draw(state, scrollX, scrollY, frame) {
      texture.offset.x = frame / frames;
      // whole pixels keep the nearest-filtered sprite crisp
      const x = Math.round(state.x - scrollX) + size / 2;
      const y = Math.round(state.y - scrollY) + size / 2;
      mesh.position.set(x, -y, 0);
      mesh.scale.x = state.facing;
      renderer.render(scene, camera);
    },
    dispose() {
      window.removeEventListener('resize', resize);
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
