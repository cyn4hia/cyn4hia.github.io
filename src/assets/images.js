/**
 * Centralized image paths.
 * In dev these resolve from /public. In production Vite handles the base path.
 * If you move images to src/assets and `import` them, update paths here.
 */

const base = import.meta.env.BASE_URL;

const images = {
  bunch: `${base}images/bunch.png`,
  leaf: `${base}images/leaf.png`,
  sweet: `${base}images/sweet.png`,
  crunchy: `${base}images/crunchy.png`,
  cold: `${base}images/cold.png`,
};

export default images;
