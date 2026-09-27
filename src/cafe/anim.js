/*
 * Tiny animation toolkit: springs for the bouncy "slightly animated" feel,
 * plus easing helpers. Everything is frame-rate independent.
 */

/** spring state */
export const sp = (x = 0) => ({ x, v: 0 });

/** advance a spring toward `target`; low damping = more wobble */
export function spring(s, target, dt, stiffness = 180, damping = 22) {
  const steps = Math.max(1, Math.ceil(dt * 240));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    const a = -stiffness * (s.x - target) - damping * s.v;
    s.v += a * h;
    s.x += s.v * h;
  }
  return s.x;
}

export const clamp01 = (x) => Math.min(1, Math.max(0, x));

export const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const easeOutBack = (t, s = 1.6) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/** exponential approach, frame-rate independent */
export const approach = (current, target, rate, dt) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

export const TAU = Math.PI * 2;
