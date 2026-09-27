/*
 * Crumple a paper note from the outside in, as a flat, drawn 2D animation.
 * The note never scales: its edge crinkles into a zigzag and eats inward
 * toward the middle (a clip-path redrawn every frame), with ink creases
 * along the crumpling edge, until only a small scrunched wad is left.
 * The wad then drops off the bottom of the screen.
 */

const POINTS = 44; // outline vertices
const GRAB_MS = 110; // tape + shadow fade before the edge starts moving
const CRUMPLE_MS = 820;
const DROP_MS = 380;
const INK = "58,46,37"; // --cafe-ink

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rand = (a, b) => a + Math.random() * (b - a);

/* evenly spaced points around the note's edge, in px */
function perimeter(w, h) {
  const len = 2 * (w + h);
  const pts = [];
  for (let i = 0; i < POINTS; i++) {
    let d = (i / POINTS) * len;
    if (d < w) pts.push([d, 0]);
    else if ((d -= w) < h) pts.push([w, d]);
    else if ((d -= h) < w) pts.push([w - d, h]);
    else pts.push([0, h - (d - w)]);
  }
  return pts;
}

/* wrap every letter of the note in its own span so each can fade on its
   own. Each text run gets one inline wrapper, so flex parents (like the
   button) still see a single item and nothing reflows */
function splitLetters(root) {
  const runs = [];
  const letters = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const run = document.createElement("span");
    run.className = "cafe-crumple-run";
    for (const token of node.nodeValue.split(/(\s+)/)) {
      if (!token) continue;
      if (!token.trim()) {
        run.append(token);
        continue;
      }
      for (const ch of token) {
        const letter = document.createElement("span");
        letter.textContent = ch;
        run.append(letter);
        letters.push(letter);
      }
    }
    node.replaceWith(run);
    runs.push([run, node]);
  }
  return { letters, restore: () => runs.forEach(([run, node]) => run.replaceWith(node)) };
}

/**
 * @returns {{ finished: Promise<boolean>, cancel: () => void }}
 *   `finished` resolves true once the wad is gone (false if cancelled).
 */
export function crumple(el) {
  /* drop the entrance animation so our inline transform takes effect */
  el.style.animation = "none";
  el.setAttribute("aria-hidden", "true"); // it's on its way out; don't re-announce the split text
  const text = splitLetters(el);
  const base = getComputedStyle(el).transform;
  const pre = base && base !== "none" ? `${base} ` : "";
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const cx = w / 2;
  const cy = h / 2;
  const wad = Math.min(w, h) * 0.2;
  const fall = window.innerHeight - el.getBoundingClientRect().top + 60;
  const drift = rand(-30, 30);
  const tilt = rand(-25, 25);

  /* every letter fades once the crumpling edge gets close to it, a little
     early or late at random, so the writing dissolves from the outside in */
  const box = el.getBoundingClientRect();
  const bx = box.left + box.width / 2;
  const by = box.top + box.height / 2;
  const glyphs = text.letters.map((node) => {
    const r = node.getBoundingClientRect();
    const x = r.left + r.width / 2 - bx;
    const y = r.top + r.height / 2 - by;
    const dist = Math.hypot(x, y) || 1;
    const ux = x / dist;
    const uy = y / dist;
    const reach = Math.min(w / 2 / Math.max(Math.abs(ux), 1e-3), h / 2 / Math.max(Math.abs(uy), 1e-3));
    return {
      node,
      rho: dist / reach + rand(-0.12, 0.12), // how far out it sits, 0 centre .. 1 edge
      wadRho: wad / reach,
      last: -1,
    };
  });

  /* each edge point heads to the middle a little out of step with its
     neighbours and gets its own crinkle depth, ending on a lumpy wad
     (low-frequency wobble, not spikes) */
  const lump = [rand(0, 6.3), rand(0, 6.3)];
  const edge = perimeter(w, h).map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx);
    const crinkle = Math.random() ** 1.6;
    return {
      ux: dx / dist,
      uy: dy / dist,
      dist,
      crinkle,
      end: wad * (1 + 0.13 * Math.sin(3 * a + lump[0]) + 0.08 * Math.sin(5 * a + lump[1]) + rand(-0.05, 0.05)),
      delay: rand(0, 0.12),
      bend: rand(-0.45, 0.45),
    };
  });
  /* a few folds across the middle, in unit-circle coordinates */
  const folds = Array.from({ length: 4 }, () => {
    const a = rand(0, Math.PI);
    return [
      [Math.cos(a), Math.sin(a)],
      [rand(-0.35, 0.35), rand(-0.35, 0.35)],
      [Math.cos(a + Math.PI + rand(-0.4, 0.4)), Math.sin(a + Math.PI + rand(-0.4, 0.4))],
    ];
  });

  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "cafe-crumple");
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  const creaseLines = document.createElementNS(ns, "path");
  const foldLines = document.createElementNS(ns, "path");
  const outline = document.createElementNS(ns, "polygon");
  creaseLines.setAttribute("stroke", `rgba(${INK},0.5)`);
  foldLines.setAttribute("stroke", `rgba(${INK},0.4)`);
  outline.setAttribute("stroke", `rgba(${INK},0.85)`);
  svg.append(creaseLines, foldLines, outline);
  el.appendChild(svg);
  el.classList.add("is-crumpling");
  el.style.pointerEvents = "none";

  const draw = (t) => {
    const pts = [];
    let creases = "";
    let mean = 0;
    for (const e of edge) {
      const p = easeInOut(clamp01((t - e.delay) / (1 - e.delay)));
      const r0 = e.dist + (e.end - e.dist) * p;
      const r = r0 - e.crinkle * p * Math.min(11, r0 * 0.12);
      const x = cx + e.ux * r;
      const y = cy + e.uy * r;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      mean += r;
      if (e.crinkle > 0.45 && p > 0.02) {
        /* a short crease running in from each fold in the edge */
        const len = 4 + 12 * p;
        const ax = e.ux * Math.cos(e.bend) - e.uy * Math.sin(e.bend);
        const ay = e.ux * Math.sin(e.bend) + e.uy * Math.cos(e.bend);
        creases += `M${x.toFixed(1)} ${y.toFixed(1)}l${(-ax * len).toFixed(1)} ${(-ay * len).toFixed(1)}`;
      }
    }
    mean /= edge.length;
    let foldPath = "";
    for (const f of folds) {
      foldPath += f
        .map(([u, v], i) => `${i ? "L" : "M"}${(cx + u * mean * 0.85).toFixed(1)} ${(cy + v * mean * 0.85).toFixed(1)}`)
        .join("");
    }
    const poly = pts.join(" ");
    el.style.clipPath = `polygon(${pts.map((pt) => pt.replace(",", "px ") + "px").join(", ")})`;
    outline.setAttribute("points", poly);
    outline.setAttribute("stroke-opacity", clamp01(t / 0.15).toFixed(2)); // ink in as the edge starts to go
    creaseLines.setAttribute("d", creases);
    foldLines.setAttribute("d", foldPath);
    foldLines.setAttribute("stroke-opacity", clamp01((t - 0.45) / 0.4).toFixed(2));
    /* the writing fades letter by letter as the edge reaches it */
    const pe = easeInOut(t);
    const late = clamp01((pe - 0.65) / 0.3); // whatever's left in the middle goes last
    for (const g of glyphs) {
      const front = 1 - pe * (1 - g.wadRho);
      const q = Math.round(Math.max(clamp01((g.rho + 0.3 - front) / 0.3), late) * 100) / 100;
      if (q === g.last) continue;
      g.last = q;
      g.node.style.opacity = q ? (1 - q).toFixed(2) : "";
    }
    /* non-text bits (the button's pill, the divider) fade out too */
    el.style.setProperty("--crumple-ink", (1 - clamp01((t - 0.4) / 0.5)).toFixed(2));
  };

  let raf = 0;
  let fallback = 0;
  let resolveDone;
  const finished = new Promise((res) => (resolveDone = res));
  const stop = (ok) => {
    cancelAnimationFrame(raf);
    clearTimeout(fallback);
    resolveDone(ok);
  };

  const t0 = performance.now();
  const frame = (now) => {
    const ms = now - t0 - GRAB_MS;
    if (ms < 0) {
      raf = requestAnimationFrame(frame);
      return;
    }
    draw(clamp01(ms / CRUMPLE_MS));
    if (ms > CRUMPLE_MS) {
      /* a flat drop: straight down with gravity and a little turn */
      const d = clamp01((ms - CRUMPLE_MS) / DROP_MS);
      el.style.transform = `${pre}translate(${(drift * d).toFixed(1)}px, ${(fall * d * d).toFixed(1)}px) rotate(${(tilt * d).toFixed(1)}deg)`;
      if (d >= 1) {
        stop(true);
        return;
      }
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  /* hidden tabs pause rAF: make sure the note still goes away */
  fallback = setTimeout(() => stop(true), GRAB_MS + CRUMPLE_MS + DROP_MS + 500);

  const cancel = () => {
    stop(false);
    text.restore();
    el.removeAttribute("aria-hidden");
    svg.remove();
    el.classList.remove("is-crumpling");
    for (const prop of ["animation", "clipPath", "transform", "pointerEvents"]) el.style[prop] = "";
    el.style.removeProperty("--crumple-ink");
  };
  return { finished, cancel };
}
