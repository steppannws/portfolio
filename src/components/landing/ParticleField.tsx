import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThemeMode } from '../../hooks/useTheme';
import styles from './ParticleField.module.css';

const SEPARATION = 26;
const GRID_X = 110;
const GRID_Y = 60;
const WAVE_AMPLITUDE = 22;

interface ParticleFieldProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollRef: React.RefObject<number>;
  theme: ThemeMode;
}

export function ParticleField({ mouseRef, scrollRef, theme }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextLost, setContextLost] = useState(false);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf1ede4, 0.0016);
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 3000);
    camera.position.set(0, 170, 560);

    const count = GRID_X * GRID_Y;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const accentFlags = new Uint8Array(count);

    let i = 0;
    let n = 0;
    for (let ix = 0; ix < GRID_X; ix++) {
      for (let iy = 0; iy < GRID_Y; iy++) {
        positions[i] = ix * SEPARATION - (GRID_X * SEPARATION) / 2;
        positions[i + 1] = 0;
        positions[i + 2] = iy * SEPARATION - (GRID_Y * SEPARATION) / 2;
        const isAccent = Math.random() < 0.07;
        accentFlags[n] = isAccent ? 1 : 0;
        colors[i] = isAccent ? 1.0 : 0.35;
        colors[i + 1] = isAccent ? 0.35 : 0.33;
        colors[i + 2] = isAccent ? 0.21 : 0.3;
        i += 3;
        n += 1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 2.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    let raf = 0;
    let frame = 0;

    const applyTheme = () => {
      scene.fog!.color.set(themeRef.current === 'light' ? 0xf1ede4 : 0x0a0a0c);
      const base = themeRef.current === 'light' ? [0.35, 0.33, 0.3] : [0.48, 0.48, 0.53];
      const colorArray = geometry.attributes.color.array as Float32Array;
      for (let k = 0; k < accentFlags.length; k++) {
        if (!accentFlags[k]) {
          const j = k * 3;
          colorArray[j] = base[0];
          colorArray[j + 1] = base[1];
          colorArray[j + 2] = base[2];
        }
      }
      geometry.attributes.color.needsUpdate = true;
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      applyTheme();
      const posArray = geometry.attributes.position.array as Float32Array;
      const mx = (mouseRef.current?.x ?? 0) * 620;
      const mz = (mouseRef.current?.y ?? 0) * 420 + 120;
      let k = 0;
      for (let ix = 0; ix < GRID_X; ix++) {
        for (let iy = 0; iy < GRID_Y; iy++) {
          let y =
            Math.sin((ix + frame) * 0.28) * WAVE_AMPLITUDE +
            Math.sin((iy + frame) * 0.46) * WAVE_AMPLITUDE;
          const dx = posArray[k] - mx;
          const dz = posArray[k + 2] - mz;
          const distSq = dx * dx + dz * dz;
          if (distSq < 200000) y += 110 * Math.exp(-distSq / 30000);
          posArray[k + 1] = y;
          k += 3;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      frame += 0.055;

      const targetZ = 560 + (scrollRef.current ?? 0) * 0.35;
      camera.position.x += ((mouseRef.current?.x ?? 0) * 90 - camera.position.x) * 0.04;
      camera.position.y += (170 + (mouseRef.current?.y ?? 0) * -40 - camera.position.y) * 0.04;
      camera.position.z += (targetZ - camera.position.z) * 0.06;
      camera.lookAt(0, 30, 0);
      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
      applyTheme();
      renderer.render(scene, camera);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [mouseRef, scrollRef]);

  if (contextLost) {
    return <div className={styles.fallback} />;
  }

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
