/*
 * Where things are on Cindy's menu drawing (public/images/menu/menu.webp),
 * in the drawing's own pixels. The menu's SVG overlays use the same
 * viewBox, so the circles, the drink in the cup and the bunny's blink all
 * line up with the art at any size.
 */

export const ART = { w: 1545, h: 1999 };
ART.aspect = ART.w / ART.h;

const f = (n) => Math.round(n * 10) / 10;

/* a smooth curve through the points (Catmull-Rom as cubic Béziers) */
function smooth(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d +=
      ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}` +
      ` ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)}` +
      ` ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/* a quick hand-drawn loop around a line of the menu: a slightly wobbly,
   slightly tilted oval that overshoots where it started */
function loopAround([x0, y0, x1, y1], seed, turns) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rx = (x1 - x0) / 2 + 44;
  const ry = (y1 - y0) / 2 + 6; // the lines are only ~12px apart
  const tilt = ((seed % 2 ? 1.5 : -2) * Math.PI) / 180;
  const a0 = Math.PI * (0.93 + (seed % 3) * 0.04);
  const pts = [];
  for (let i = 0, n = 30; i <= n; i++) {
    const t = i / n;
    const a = a0 + t * turns * 2 * Math.PI;
    const k = 1 + 0.045 * Math.sin(a * 2 + seed) + 0.08 * (t - 0.5);
    const ex = rx * k * Math.cos(a);
    const ey = ry * (1 + (k - 1) * 0.5) * Math.sin(a); // wobbles less up and down, to keep off the next line
    pts.push([cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)]);
  }
  return smooth(pts);
}

/* every line on the menu, boxed tight around its lettering */
export const DISHES = [
  { id: "isuzu", name: "Isuzu latte", section: "Matcha", box: [1016, 1050, 1268, 1107] },
  { id: "strawberry-matcha", name: "Strawberry matcha", section: "Matcha", box: [908, 1119, 1376, 1176] },
  { id: "waketake", name: "Waketake latte", section: "Matcha", box: [958, 1188, 1324, 1245] },
  { id: "choco-cookie", name: "Choco cookie", section: "Sweets", box: [990, 1528, 1294, 1586] },
  { id: "tiramisu", name: "Tiramisu", section: "Sweets", box: [1046, 1600, 1236, 1657] },
  { id: "shortcake", name: "Strawberry shortcake", section: "Sweets", box: [876, 1666, 1408, 1724] },
].map((d, i) => ({ ...d, loop: loopAround(d.box, i + 1, 1.12), loop2: loopAround(d.box, i + 4, 1.04) }));

/* what each drink looks like poured into the doodled cup, top to bottom */
export const DRINKS = {
  isuzu: [
    [0, "#76ab42"],
    [0.32, "#8dbd56"],
    [0.62, "#bcd893"],
    [1, "#e9efd6"],
  ],
  "strawberry-matcha": [
    [0, "#7fb14b"],
    [0.27, "#9cc56b"],
    [0.38, "#f5efe3"],
    [0.56, "#f7e5df"],
    [0.68, "#f2a7b4"],
    [1, "#e8879a"],
  ],
  waketake: [
    [0, "#a6c55e"],
    [0.4, "#c3d98a"],
    [1, "#eef0d4"],
  ],
};

/* the drink line drawn across the cup, left to right */
const SURFACE = [
  [96, 1459],
  [180, 1450],
  [290, 1440],
  [400, 1432],
  [470, 1412],
  [520, 1392],
  [565, 1377],
  [640, 1379],
  [740, 1381],
];

/* the inside of the cup, from just below the rim down round the bottom */
const INSIDE = [
  [138, 1290], [152, 1360], [163, 1400], [176, 1440], [194, 1500], [206, 1540], [219, 1600],
  [226, 1640], [240, 1700], [252, 1740], [271, 1800], [279, 1820], [290, 1836], [322, 1852],
  [352, 1864], [420, 1884], [500, 1872], [560, 1858], [610, 1843], [652, 1832], [680, 1818],
  [688, 1790], [679, 1740], [674, 1700], [669, 1640], [665, 1600], [657, 1540], [658, 1500],
  [654, 1440], [646, 1400], [637, 1360], [629, 1290],
];

export const CUP = {
  inside: `M${INSIDE.map(([x, y]) => `${x} ${y}`).join(" L")} Z`,
  surface: smooth(SURFACE),
  drink: `${smooth(SURFACE)} L740 1990 L96 1990 Z`,
  top: 1376,
  bottom: 1888,
  pivot: [400, 1420], // the liquid tilts about the middle of its surface
  empty: 540, // how far below the drink line the liquid sits when the cup's empty
};

/* the bunny in the top-right corner: its eyes (for blinking) and where
   a little heart pops up when you order something */
export const BUNNY = {
  eyes: [
    { cx: 1219, cy: 502.5, rx: 23, ry: 15, lid: "M1202 501 Q1219 512 1236 501" },
    { cx: 1349.5, cy: 508, rx: 23, ry: 17, lid: "M1332 506 Q1349 517 1367 506" },
  ],
  heart: { x: (1282 / ART.w) * 100, y: (300 / ART.h) * 100 },
};
