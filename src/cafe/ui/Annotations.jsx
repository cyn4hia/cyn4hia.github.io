import { ITEMS } from "../config";

/* a bowed, hand-drawn arrow from the label toward the item */
function arrow(dx, dy) {
  const sx = dx * 0.72;
  const sy = dy * 0.72 + (dy < 0 ? 14 : -14);
  const ex = dx * 0.12;
  const ey = dy * 0.12;
  const len = Math.hypot(ex - sx, ey - sy) || 1;
  const nx = -(ey - sy) / len;
  const ny = (ex - sx) / len;
  const bow = len * 0.24 * (dx > 0 ? 1 : -1);
  const cx = (sx + ex) / 2 + nx * bow;
  const cy = (sy + ey) / 2 + ny * bow;
  const tl = Math.hypot(ex - cx, ey - cy) || 1;
  const tx = (ex - cx) / tl;
  const ty = (ey - cy) / tl;
  const head = (a) => [
    ex - 9 * (tx * Math.cos(a) - ty * Math.sin(a)),
    ey - 9 * (ty * Math.cos(a) + tx * Math.sin(a)),
  ];
  const [h1x, h1y] = head(0.5);
  const [h2x, h2y] = head(-0.5);
  return {
    line: `M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`,
    head: `M${h1x.toFixed(1)},${h1y.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)} L${h2x.toFixed(1)},${h2y.toFixed(1)}`,
  };
}

const PATHS = Object.fromEntries(ITEMS.map((it) => [it.id, arrow(it.note.dx, it.note.dy)]));

/**
 * The sketch's handwritten labels, redrawn over the live scene. Their
 * positions are written every frame by the 3D LabelTracker via refs.
 */
export default function Annotations({ labelRefs, visibleIds }) {
  return (
    <div className="cafe-notes" aria-hidden="true">
      {ITEMS.map((it, i) => {
        const p = PATHS[it.id];
        const on = visibleIds.has(it.id);
        return (
          <div
            key={it.id}
            ref={(el) => (labelRefs.current[it.id] = el)}
            className={`cafe-note${on ? " is-on" : ""}`}
          >
            <svg width="1" height="1">
              <path d={p.line} />
              <path className="cafe-note-head" d={p.head} />
            </svg>
            <div
              className="cafe-note-text"
              style={{
                left: it.note.dx,
                top: it.note.dy + (it.note.dy < 0 ? -6 : 6),
                "--tilt": `${i % 2 ? 2.5 : -3}deg`,
              }}
            >
              {it.label}
              <small>{it.title}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}
