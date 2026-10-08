/**
 * Centralized image paths.
 * In dev these resolve from /public. In production Vite handles the base path.
 * If you move images to src/assets and `import` them, update paths here.
 */

const base = import.meta.env.BASE_URL;

const images = {
  // the café menu: Cindy's drawing for the front, and a doodle (black
  // strokes on transparent, used as a CSS mask) for the back
  menu: `${base}images/menu/menu.webp`,
  menuCat: `${base}images/menu/cat.webp`,
  // small copies of the content portfolio's covers, for the kettle's note
  portfolioAvatar: `${base}images/portfolio/pfp.jpg`,
  portfolioFable5: `${base}images/portfolio/fable5.jpg`,
  portfolioMog: `${base}images/portfolio/mog.jpg`,
  portfolioWeathering: `${base}images/portfolio/weathering.jpg`,
  portfolioNaming: `${base}images/portfolio/naming.jpg`,
  // drop any of these into public/images and the matching contact
  // profile card picks it up automatically (placeholders until then)
  avatarLinkedin: `${base}images/avatar-linkedin.png`,
  avatarGithub: `${base}images/avatar-github.png`,
  avatarDiscord: `${base}images/avatar-discord.png`,
  bannerLinkedin: `${base}images/banner-linkedin.png`,
  bannerDiscord: `${base}images/banner-discord.png`,
};

export default images;
