import * as THREE from "three";

/*
 * Procedural textures for the café, painted on canvases at load time so the
 * scene ships without any image downloads. Everything is deterministic
 * (seeded hash noise) so the room looks identical on every visit.
 */

/* ── noise ─────────────────────────────────────────────────────── */

function hash(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed + 1, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/* smooth value noise; tiles every px / py lattice cells when given */
export function vnoise(x, y, seed = 0, px = 0, py = 0) {
  let x0 = Math.floor(x);
  let y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  let x1 = x0 + 1;
  let y1 = y0 + 1;
  if (px) {
    x0 = ((x0 % px) + px) % px;
    x1 = ((x1 % px) + px) % px;
  }
  if (py) {
    y0 = ((y0 % py) + py) % py;
    y1 = ((y1 % py) + py) % py;
  }
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, seed);
  const b = hash(x1, y0, seed);
  const c = hash(x0, y1, seed);
  const d = hash(x1, y1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x, y, octaves = 4, seed = 0, px = 0, py = 0) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * vnoise(x, y, seed + o * 17, px, py);
    norm += amp;
    amp *= 0.5;
    x *= 2;
    y *= 2;
    px *= 2;
    py *= 2;
  }
  return sum / norm;
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ── canvas plumbing ───────────────────────────────────────────── */

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(canvas, { srgb = true, repeat = true } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/* soft blur that works everywhere (ctx.filter isn't in every Safari):
   shrink with smoothing, then scale back up */
function softBlur(canvas, factor = 4) {
  const w = canvas.width;
  const h = canvas.height;
  const small = makeCanvas(Math.max(1, Math.round(w / factor)), Math.max(1, Math.round(h / factor)));
  const sctx = small.getContext("2d");
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(canvas, 0, 0, small.width, small.height);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, w, h);
}

/* redraw a text texture once web fonts land (canvas can't wait for them) */
function whenFontsReady(redraw) {
  if (typeof document === "undefined" || !document.fonts) return;
  document.fonts.ready.then(redraw).catch(() => {});
}

/* ── wood ──────────────────────────────────────────────────────── */

/**
 * Glued-up plank wood. Grain runs along the texture's x axis (or y when
 * `vertical`), and the pattern tiles along the grain so it can repeat.
 * Returns a colour map and a matching bump map.
 */
export function makeWood({
  width = 2048,
  height = 512,
  boards = 4,
  vertical = false,
  seed = 3,
  light = [226, 182, 128],
  mid = [204, 150, 92],
  dark = [132, 84, 44],
}) {
  const color = makeCanvas(width, height);
  const bump = makeCanvas(width, height);
  const cctx = color.getContext("2d");
  const bctx = bump.getContext("2d");
  const cimg = cctx.createImageData(width, height);
  const bimg = bctx.createImageData(width, height);
  const along = vertical ? height : width;
  const across = vertical ? width : height;
  const boardW = across / boards;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const a = vertical ? py : px; // along the grain
      const c = vertical ? px : py; // across the grain
      const b = Math.min(boards - 1, Math.floor(c / boardW));
      const local = c - b * boardW;
      const bs = seed * 31 + b * 7;
      const u = a / along; // 0..1 along, tiles

      /* growth rings: mostly straight, bent by long slow meanders */
      const warp =
        (fbm(u * 3, local * 0.01, 3, bs, 3, 0) - 0.5) * 34 +
        Math.sin(u * Math.PI * 2 + b * 1.7) * 5;
      const spacing = 7 + (b % 3) * 2;
      const ring = (local + warp) / spacing;
      const f = ring - Math.floor(ring);
      const late = smooth(0.52, 0.78, f) * (1 - smooth(0.84, 1, f));

      /* fine streaks + open pores (oak-ish) */
      const streak = vnoise(u * 90, c * 0.35, bs + 3, 90, 0);
      const pore = smooth(0.8, 0.95, vnoise(u * 700, c * 0.9, bs + 5, 700, 0));
      const tone = (hash(b, 11, seed) - 0.5) * 0.16;

      /* seam between boards */
      const edge = Math.min(local, boardW - local);
      const seam = boards > 1 ? 1 - smooth(0.6, 2.2, edge) : 0;

      let t = 0.3 + streak * 0.45 + tone;
      t = Math.min(1, Math.max(0, t));
      let r = light[0] + (mid[0] - light[0]) * t;
      let g = light[1] + (mid[1] - light[1]) * t;
      let bl = light[2] + (mid[2] - light[2]) * t;
      const dk = late * 0.42 + pore * 0.3 + seam * 0.55;
      r += (dark[0] - r) * dk;
      g += (dark[1] - g) * dk;
      bl += (dark[2] - bl) * dk;

      const i = (py * width + px) * 4;
      cimg.data[i] = r;
      cimg.data[i + 1] = g;
      cimg.data[i + 2] = bl;
      cimg.data[i + 3] = 255;
      const h = 255 * (1 - late * 0.35 - pore * 0.6 - seam * 0.8);
      bimg.data[i] = bimg.data[i + 1] = bimg.data[i + 2] = h;
      bimg.data[i + 3] = 255;
    }
  }
  cctx.putImageData(cimg, 0, 0);
  bctx.putImageData(bimg, 0, 0);
  return { map: toTexture(color), bump: toTexture(bump, { srgb: false }) };
}

/* ── plaster wall ──────────────────────────────────────────────── */

export function makePlaster(size = 512) {
  const color = makeCanvas(size, size);
  const bump = makeCanvas(size, size);
  const cctx = color.getContext("2d");
  const bctx = bump.getContext("2d");
  const cimg = cctx.createImageData(size, size);
  const bimg = bctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const mottle = fbm(u * 5, v * 5, 4, 41, 5, 5);
      const trowel = fbm(u * 24, v * 9, 3, 43, 24, 9);
      const grit = hash(x, y, 47);
      const k = 1 + (mottle - 0.5) * 0.07 + (trowel - 0.5) * 0.035 + (grit - 0.5) * 0.025;
      const i = (y * size + x) * 4;
      cimg.data[i] = 255 * k;
      cimg.data[i + 1] = 255 * k;
      cimg.data[i + 2] = 255 * k;
      cimg.data[i + 3] = 255;
      const h = 128 + (trowel - 0.5) * 120 + (grit - 0.5) * 50;
      bimg.data[i] = bimg.data[i + 1] = bimg.data[i + 2] = h;
      bimg.data[i + 3] = 255;
    }
  }
  cctx.putImageData(cimg, 0, 0);
  bctx.putImageData(bimg, 0, 0);
  return { map: toTexture(color), bump: toTexture(bump, { srgb: false }) };
}

/* ── ceramic glaze (chawan) ────────────────────────────────────── */

/**
 * Wraps a lathe: u runs around the bowl, v runs along the profile from the
 * foot (v=0) over the rim to the inside bottom (v=1). The unglazed foot
 * ring shows raw clay below `footV`.
 */
export function makeGlaze({ footV = 0.17, seed = 9 } = {}) {
  const w = 1024;
  const h = 512;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const mottle = fbm(u * 8, v * 4, 4, seed, 8, 0);
      const drip = (fbm(u * 22, 0.5, 3, seed + 2, 22, 0) - 0.5) * 0.05;
      const edge = footV + drip;
      let r, g, b;
      if (v < edge) {
        /* raw clay: warm, gritty */
        const grit = hash(x, y, seed + 3);
        r = 196 + (grit - 0.5) * 30 + (mottle - 0.5) * 20;
        g = 162 + (grit - 0.5) * 26 + (mottle - 0.5) * 16;
        b = 124 + (grit - 0.5) * 22 + (mottle - 0.5) * 12;
      } else {
        /* oatmeal glaze, pooling a little darker at its edge */
        const pool = 1 - smooth(0, 0.05, v - edge);
        r = 236 + (mottle - 0.5) * 16 - pool * 34;
        g = 228 + (mottle - 0.5) * 14 - pool * 30;
        b = 212 + (mottle - 0.5) * 12 - pool * 22;
      }
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  /* iron speckles bleeding through the glaze */
  let s = seed;
  const rnd = () => hash(s++, 7, seed);
  for (let k = 0; k < 900; k++) {
    const x = rnd() * w;
    const y = (footV + 0.04 + rnd() * (1 - footV - 0.04)) * h;
    const r = 0.6 + Math.pow(rnd(), 3) * 2.6;
    ctx.fillStyle = `rgba(${96 + rnd() * 30},${62 + rnd() * 20},${40 + rnd() * 15},${0.45 + rnd() * 0.45})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.2, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(c);
}

/* ── matcha foam + powder ──────────────────────────────────────── */

export function makeFoam(size = 512) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);
  const half = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - half) / half;
      const dy = (y - half) / half;
      const d = Math.sqrt(dx * dx + dy * dy);
      const n = fbm(x / 40, y / 40, 4, 61);
      const micro = hash(x, y, 63);
      /* creamy microfoam in the middle, deeper green toward the wall */
      const cream = (1 - smooth(0.1, 0.85, d + (n - 0.5) * 0.5)) * 0.55;
      const edge = smooth(0.82, 1, d);
      let r = 128 + cream * 70 - edge * 30 + (micro - 0.5) * 10;
      let g = 166 + cream * 50 - edge * 36 + (micro - 0.5) * 10;
      let b = 64 + cream * 60 - edge * 18 + (micro - 0.5) * 8;
      const i = (y * size + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  /* bubbles */
  let s = 5;
  const rnd = () => hash(s++, 3, 71);
  for (let k = 0; k < 520; k++) {
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd()) * half * 0.95;
    const x = half + Math.cos(a) * rr;
    const y = half + Math.sin(a) * rr;
    const r = 0.8 + Math.pow(rnd(), 4) * 4;
    ctx.strokeStyle = `rgba(235,245,205,${0.25 + rnd() * 0.35})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  return toTexture(c, { repeat: false });
}

export function makePowder(size = 256) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(x / 22, y / 22, 4, 81);
      const grit = hash(x, y, 83);
      const k = 0.82 + n * 0.3 + (grit - 0.5) * 0.18;
      const i = (y * size + x) * 4;
      img.data[i] = 104 * k;
      img.data[i + 1] = 158 * k;
      img.data[i + 2] = 52 * k;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c);
}

/* ── the tin's wrap-around washi label ─────────────────────────── */

export function makeTinLabel() {
  const w = 1024;
  const h = 512;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");
  const tex = toTexture(c, { repeat: false });

  /* the washi fibres are the slow part: paint them once, reuse on repaint */
  const paper = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const fiber = vnoise(x / 3, y / 40, 91) * 0.5 + vnoise(x / 40, y / 3, 93) * 0.5;
      const k = 0.97 + (fiber - 0.5) * 0.06;
      const i = (y * w + x) * 4;
      paper.data[i] = 246 * k;
      paper.data[i + 1] = 239 * k;
      paper.data[i + 2] = 222 * k;
      paper.data[i + 3] = 255;
    }
  }

  const paint = () => {
    ctx.putImageData(paper, 0, 0);

    /* bands top and bottom */
    ctx.fillStyle = "#6f8f3e";
    ctx.fillRect(0, 0, w, 34);
    ctx.fillRect(0, h - 34, w, 34);
    ctx.fillStyle = "#c9a45c";
    ctx.fillRect(0, 38, w, 4);
    ctx.fillRect(0, h - 42, w, 4);

    /* the front panel is centred on u = 0.5 */
    const cx = w * 0.5;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#3f5a22";
    ctx.font = '600 132px "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
    ctx.fillText("抹", cx, 158);
    ctx.fillText("茶", cx, 300);

    ctx.fillStyle = "#4a4035";
    ctx.font = 'italic 400 44px "Cormorant Garamond", serif';
    ctx.fillText("cindy's blend", cx, 400);
    ctx.font = '500 17px "DM Sans", sans-serif';
    ctx.fillStyle = "#7c705f";
    ctx.fillText("C E R E M O N I A L   ·   S T O N E - G R O U N D", cx, 438);

    /* little leaf sprigs either side */
    const leaf = (x, y, rot, s) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(s, s);
      ctx.fillStyle = "#7fa24a";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(18, -16, 0, -52);
      ctx.quadraticCurveTo(-18, -16, 0, 0);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, -46);
      ctx.stroke();
      ctx.restore();
    };
    leaf(cx - 118, 250, -0.5, 1);
    leaf(cx - 104, 262, -1.1, 0.8);
    leaf(cx + 118, 250, 0.5, 1);
    leaf(cx + 104, 262, 1.1, 0.8);

    /* back panel: small print */
    ctx.fillStyle = "#8a7c69";
    ctx.font = '500 20px "DM Sans", sans-serif';
    ["net wt. 30g", "uji, kyoto", "whisk at 80°c"].forEach((line, i) => {
      ctx.fillText(line, w * 0.02 + 70, 200 + i * 36);
      ctx.fillText(line, w * 0.98 - 70, 200 + i * 36);
    });
    tex.needsUpdate = true;
  };
  paint();
  whenFontsReady(paint);
  return tex;
}

/* ── kettle base display ───────────────────────────────────────── */

export function makeLcd() {
  const c = makeCanvas(256, 96);
  const ctx = c.getContext("2d");
  const tex = toTexture(c, { repeat: false });
  let last = null;
  const draw = (temp, heating) => {
    const key = `${temp}|${heating}`;
    if (key === last) return;
    last = key;
    ctx.fillStyle = "#0d0f10";
    ctx.fillRect(0, 0, 256, 96);
    ctx.fillStyle = heating ? "#ffd9a0" : "#f4efe6";
    ctx.font = '500 58px "DM Sans", ui-monospace, monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${temp}°`, 190, 50);
    ctx.font = '500 26px "DM Sans", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText("C", 196, 36);
    if (heating) {
      ctx.fillStyle = "#ff9d5c";
      ctx.beginPath();
      ctx.arc(26, 48, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    tex.needsUpdate = true;
  };
  draw(80, false);
  whenFontsReady(() => {
    const [t, h] = last.split("|");
    last = null;
    draw(t, h === "true");
  });
  return { texture: tex, draw };
}

/* ── small utility sprites ─────────────────────────────────────── */

/* radial contact shadow */
export function makeBlob(size = 128) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(40,24,12,1)");
  g.addColorStop(0.35, "rgba(40,24,12,0.55)");
  g.addColorStop(0.7, "rgba(40,24,12,0.14)");
  g.addColorStop(1, "rgba(40,24,12,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return toTexture(c, { repeat: false });
}

/* soft round mote */
export function makeDot(size = 64) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return toTexture(c, { repeat: false });
}

/* tileable, contrast-stretched fbm for the steam shader */
export function makeSteamNoise(size = 128) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);
  const vals = new Float32Array(size * size);
  let lo = 1;
  let hi = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = fbm((x / size) * 6, (y / size) * 6, 4, 101, 6, 6);
      vals[y * size + x] = v;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  for (let k = 0; k < vals.length; k++) {
    const v = (vals[k] - lo) / (hi - lo);
    img.data[k * 4] = img.data[k * 4 + 1] = img.data[k * 4 + 2] = v * 255;
    img.data[k * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = toTexture(c, { srgb: false });
  t.anisotropy = 1;
  return t;
}

/* ── sunlight through a window, with a plant swaying outside ───── */

/**
 * A "light cookie" for the sun spotlight: the window panes are lit, the
 * frame and leaves block light. `update(t)` re-sways the leaves.
 */
export function makeWindowCookie(size = 512) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const tex = toTexture(c, { repeat: false });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  /* re-uploaded as the leaves sway: skip mipmaps to keep that cheap */
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;

  /* static window, pre-softened */
  const win = makeCanvas(size, size);
  const wctx = win.getContext("2d");
  /* keep the window inside the spotlight's circular cone */
  const L = size * 0.18;
  const T = size * 0.13;
  const W = size * 0.64;
  const H = size * 0.74;
  const bar = size * 0.02;
  wctx.fillStyle = "#000";
  wctx.fillRect(0, 0, size, size);
  wctx.fillStyle = "#fff";
  wctx.fillRect(L, T, W, H);
  wctx.fillStyle = "#000";
  wctx.fillRect(L + W / 2 - bar / 2, T, bar, H); // mullion
  wctx.fillRect(L, T + H * 0.3 - bar / 2, W, bar); // transom
  softBlur(win, 3);

  /* leaves live on a small canvas so upscaling blurs them for free */
  const lsz = size / 4;
  const leaves = makeCanvas(lsz, lsz);
  const lctx = leaves.getContext("2d");

  const stems = [
    { x: 1.02, y: -0.02, ang: 2.25, len: 0.55, leaves: 7, phase: 0 },
    { x: 1.02, y: 0.25, ang: 2.75, len: 0.42, leaves: 5, phase: 1.7 },
    { x: 0.75, y: -0.04, ang: 1.95, len: 0.36, leaves: 5, phase: 3.1 },
  ];

  const drawLeaves = (t) => {
    lctx.clearRect(0, 0, lsz, lsz);
    lctx.fillStyle = "rgba(0,0,0,0.92)";
    lctx.strokeStyle = "rgba(0,0,0,0.9)";
    for (const s of stems) {
      const sway = Math.sin(t * 0.7 + s.phase) * 0.07 + Math.sin(t * 1.9 + s.phase * 2) * 0.025;
      const ang = s.ang + sway;
      const x0 = s.x * lsz;
      const y0 = s.y * lsz;
      const x1 = x0 + Math.cos(ang) * s.len * lsz;
      const y1 = y0 + Math.sin(ang) * s.len * lsz;
      lctx.lineWidth = 1.2;
      lctx.beginPath();
      lctx.moveTo(x0, y0);
      lctx.lineTo(x1, y1);
      lctx.stroke();
      for (let i = 1; i <= s.leaves; i++) {
        const k = i / (s.leaves + 0.5);
        const lx = x0 + (x1 - x0) * k;
        const ly = y0 + (y1 - y0) * k;
        const side = i % 2 ? 1 : -1;
        const flutter = Math.sin(t * 2.3 + i * 1.3 + s.phase) * 0.18;
        const la = ang + side * 0.95 + flutter;
        const ll = lsz * (0.07 + 0.03 * Math.sin(i * 2.1 + s.phase));
        lctx.save();
        lctx.translate(lx, ly);
        lctx.rotate(la);
        lctx.beginPath();
        lctx.moveTo(0, 0);
        lctx.quadraticCurveTo(ll * 0.5, -ll * 0.42, ll, 0);
        lctx.quadraticCurveTo(ll * 0.5, ll * 0.42, 0, 0);
        lctx.fill();
        lctx.restore();
      }
    }
  };

  let lastT = -1;
  const update = (t) => {
    if (t >= lastT && t - lastT < 1 / 12) return; // 12 fps is plenty for a breeze (t < lastT: clock was reset)
    lastT = t;
    drawLeaves(t);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(win, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(leaves, 0, 0, size, size);
    /* re-fill the knocked-out areas with black (a cookie needs opaque texels) */
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "source-over";
    tex.needsUpdate = true;
  };
  update(0);
  return { texture: tex, update };
}
