/*
 * Everything on the table, in one place. Units are decimetres (1 = 10 cm),
 * so the table is ~1 m wide and ~74 cm tall.
 *
 * What picking an item up shows: `content` puts that section right on its
 * note ("about", "interests", "contact", "portfolio", or the projects
 * "receipt"; the words live in content.js); otherwise the note links out
 * via `href` (an external link). Positions are [x, z] on the table top;
 * the camera is in front of the table looking toward -z.
 */

export const TABLE = { width: 10.4, depth: 5.4, height: 7.4, thickness: 0.36 };
export const WALL_Z = -3.25;
/* items are drawn a touch larger than life, like the sketch */
export const ITEM_SCALE = 1.35;

/* overview framing (the sketch's slightly-above, straight-on view) */
export const VIEW = {
  fov: 30,
  position: [0.25, 17.4, 20.6],
  target: [0, 6.5, -0.4],
  intro: { position: [-2.6, 10.5, 32], target: [0, 7.2, 0] },
  designAspect: 16 / 10,
};

export const ITEMS = [
  {
    id: "tools",
    label: "matcha tools",
    title: "About me",
    tagline: "the hands behind it",
    content: "about",
    position: [-4.15, 0.85],
    rotation: 0.1,
    anchor: [0, 1.25, 0],
    hit: { type: "box", size: [1.3, 1.7, 1.0], offset: [-0.1, 0.8, 0] },
    shadow: { size: [1.4, 1.0], opacity: 0.5 },
    focus: { lift: 0.25, look: 0.65, dist: 4.4, elev: 0.3, azim: -0.38 },
    note: { dx: -96, dy: -92 },
  },
  {
    id: "chawan",
    label: "chawan",
    title: "Projects",
    tagline: "freshly whisked",
    content: "receipt",
    position: [-2.35, 1.05],
    rotation: -0.4,
    anchor: [0.5, 0.55, 0],
    hit: { type: "cyl", radius: 0.95, height: 0.95, offset: [0, 0.45, 0] },
    shadow: { size: [2.0, 2.0], opacity: 0.55 },
    focus: { lift: 0.35, look: 0.4, dist: 5.6, elev: 0.6, azim: 0.12 },
    note: { dx: 118, dy: 34 },
  },
  {
    id: "glasses",
    label: "empty glasses",
    title: "Contact",
    tagline: "one's for you",
    content: "contact",
    position: [-2.45, -1.55],
    rotation: 0,
    anchor: [0.4, 1.35, 0],
    hit: { type: "box", size: [2.6, 1.55, 1.1], offset: [0, 0.72, 0] },
    shadow: { size: [3.0, 1.4], opacity: 0.4 },
    focus: { lift: 0.2, look: 0.75, dist: 6.2, elev: 0.42, azim: 0.45 },
    note: { dx: 70, dy: -86 },
  },
  {
    id: "tin",
    label: "matcha tin",
    title: "Interests",
    tagline: "cindy's blend",
    content: "interests",
    position: [-0.1, -0.4],
    rotation: 0,
    anchor: [0, 0.98, 0],
    hit: { type: "cyl", radius: 0.6, height: 1.15, offset: [0, 0.55, 0] },
    shadow: { size: [1.3, 1.3], opacity: 0.55 },
    focus: { lift: 0.3, look: 0.6, dist: 4.9, elev: 0.36, azim: -0.05 },
    note: { dx: 84, dy: -104 },
  },
  {
    id: "kettle",
    label: "electric kettle",
    title: "Content",
    tagline: "what's brewing",
    content: "portfolio",
    position: [2.9, -0.3],
    rotation: -0.12,
    anchor: [0.1, 2.0, 0],
    hit: { type: "box", size: [3.1, 2.3, 2.0], offset: [-0.15, 1.1, 0] },
    shadow: { size: [3.0, 2.4], opacity: 0.5 },
    focus: { lift: 0.0, look: 0.95, dist: 8.6, elev: 0.3, azim: -0.12 },
    note: { dx: 96, dy: -96 },
  },
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it]));
