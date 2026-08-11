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
  contact: `${base}images/contact.png`,
  // drop any of these into public/images and the matching contact
  // profile card picks it up automatically (placeholders until then)
  avatarLinkedin: `${base}images/avatar-linkedin.png`,
  avatarGithub: `${base}images/avatar-github.png`,
  avatarDiscord: `${base}images/avatar-discord.png`,
  bannerLinkedin: `${base}images/banner-linkedin.png`,
  bannerDiscord: `${base}images/banner-discord.png`,
};

export default images;
