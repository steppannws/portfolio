import type { ClimberOptions } from './controller';

let loading = false;

/** Easter egg: a pixel mountaineer that walks on the page's elements. Three.js loads on first use. */
export async function toggleClimber(opts: ClimberOptions): Promise<void> {
  if (loading) return;
  loading = true;
  try {
    const [{ toggle }] = await Promise.all([
      import('./controller'),
      // the hero name is still rising into place right after load; measure it once it has settled
      Promise.allSettled((opts.anchor.getAnimations?.() ?? []).map((a) => a.finished)),
    ]);
    toggle(opts);
  } finally {
    loading = false;
  }
}
