import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ITEM_BY_ID } from "../config";
import images from "../../assets/images";
import MenuFront from "./MenuFront";
import { ART, CUP, DRINKS } from "./menuArt";

/* the back of the menu: everything on the table, and where it leads */
const ON_THE_TABLE = ["tools", "kettle", "glasses", "tin", "chawan"].map((id) => ITEM_BY_ID[id]);

const REST_TILT = -4; // how the menu lies in its corner (deg)
const OPEN_TILT = -1;
const DRAG_FROM = 5; // px a press travels before it's a drag rather than a click
const THROW_AT = 1100; // px/s: let go faster than this and the menu slides off across the screen
const PUT_DOWN_AT = 150; // px: pull the held-up menu this far from the middle and it's put down there
const MARGIN = 10; // px the resting menu keeps from the screen's edges

/* [stiffness, damping ratio] for each value; under 1 wobbles, like paper */
const SPRINGS = {
  x: [150, 0.78],
  y: [150, 0.78],
  s: [170, 0.82],
  r: [110, 0.42],
  rx: [130, 0.45],
  ry: [130, 0.45],
  lift: [120, 0.9],
  slosh: [50, 0.12],
  fill: [14, 1],
  drain: [90, 1],
};
const PAPER = ["x", "y", "s", "r", "rx", "ry", "lift"];
/* close enough to count as arrived, so the animation loop can sleep */
const EPS = { x: 0.05, y: 0.05, s: 0.0004, r: 0.01, rx: 0.02, ry: 0.02, lift: 0.002, slosh: 0.03, fill: 0.3 };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rad = (deg) => (deg * Math.PI) / 180;

function spring(st, key, target, dt, calm, [k, z] = SPRINGS[key]) {
  const damping = 2 * (calm ? Math.max(z, 1) : z) * Math.sqrt(k);
  st.v[key] += (k * (target - st[key]) - damping * st.v[key]) * dt;
  st[key] += st.v[key] * dt;
}

/* the menu's full (held-up) size, and how small it is lying in the corner */
function measure() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let H = Math.min(vh * 0.86, 1040);
  let W = H * ART.aspect;
  if (W > vw * 0.92) {
    W = vw * 0.92;
    H = W / ART.aspect;
  }
  const restW = Math.min(clamp(vw * 0.135, 160, 230), vh * 0.36 * ART.aspect);
  return { vw, vh, W, H, rest: restW / W };
}

/* where the menu lies until someone moves it: the bottom-left corner */
function homeSpot(L) {
  const left = clamp(L.vw * 0.04, 16, 56);
  const bottom = clamp(L.vh * 0.05, 16, 48);
  return { x: left + (L.W * L.rest) / 2, y: L.vh - bottom - (L.H * L.rest) / 2, r: REST_TILT, moved: false };
}

/* the range of centres that keeps the resting menu on screen */
function bounds(L) {
  const hw = (L.W * L.rest) / 2 + MARGIN;
  const hh = (L.H * L.rest) / 2 + MARGIN;
  return { x0: hw, x1: Math.max(hw, L.vw - hw), y0: hh, y1: Math.max(hh, L.vh - hh) };
}

/* the dog-eared corner you turn the menu over by */
function Corner({ label, onFlip }) {
  return (
    <button type="button" className="cafe-menu-corner" onClick={onFlip} aria-label={label}>
      <span className="cafe-menu-flap" aria-hidden="true" />
      <span className="cafe-menu-corner-label" aria-hidden="true">
        {label} ↻
      </span>
    </button>
  );
}

/* the back: the table's guide, in the front's lettering */
function MenuBack({ focused, onHover, onPick }) {
  return (
    <>
      <span className="cafe-doodle cafe-menu-cat" style={{ "--src": `url(${images.menuCat})` }} aria-hidden="true" />
      <header className="cafe-menu-back-head">
        <p className="cafe-menu-back-kicker" aria-hidden="true">
          What&rsquo;s on
        </p>
        <h2 className="cafe-menu-back-title">
          <span className="cafe-sr">What&rsquo;s on </span>the table
        </h2>
        <p className="cafe-menu-back-sub">house specials</p>
      </header>
      <ul className="cafe-menu-guide">
        {ON_THE_TABLE.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              className={focused === it.id ? "is-active" : undefined}
              onMouseEnter={() => onHover(it.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(it.id)}
              onBlur={() => onHover(null)}
              onClick={() => onPick(it.id)}
            >
              <span className="cafe-menu-guide-name">{it.label}</span>
              <span className="cafe-menu-guide-dots" aria-hidden="true" />
              <span className="cafe-menu-guide-dest">{it.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="cafe-menu-back-foot">click one to pick it up</p>
    </>
  );
}

/**
 * Cindy's café menu, as a piece of paper you can handle. It lies in the
 * corner; drag it anywhere (it swings about where you hold it, and slides
 * if you fling it), or click to pick it up and read it. Held up, it tilts
 * toward the pointer, and its dog-eared corner turns it over: the front is
 * the drinks and sweets (ordering one circles it, and a drink gets poured
 * into the doodled cup), the back is the table guide that gets you to
 * every part of the site.
 *
 * Motion runs on springs in one rAF loop that writes transforms straight
 * to the DOM, and sleeps once everything has settled.
 */
export default function MenuCard({ hidden, focused, reducedMotion = false, onHover, onSelect, onOpen }) {
  const [layout, setLayout] = useState(measure);
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [ordered, setOrdered] = useState([]);

  const card = useRef(null);
  const shadow = useRef(null);
  const liquid = useRef(null);
  const drink = useRef(null);
  const front = useRef(null);
  const back = useRef(null);
  const pickup = useRef(null);

  const L = useRef(layout);
  const rest = useRef(null);
  if (!rest.current) rest.current = homeSpot(layout);
  const sim = useRef(null);
  if (!sim.current) {
    const { x, y, r } = rest.current;
    sim.current = {
      x,
      y,
      r,
      s: layout.rest,
      rx: 0,
      ry: 0,
      lift: 0,
      slosh: 0,
      fill: CUP.empty,
      v: { x: 0, y: 0, s: 0, r: 0, rx: 0, ry: 0, lift: 0, slosh: 0, fill: 0 },
      lastX: x,
      lastVx: 0,
      ax: 0,
    };
  }
  const mode = useRef({ open: false, hidden, hover: false, calm: reducedMotion });
  const drag = useRef(null);
  const slide = useRef(null);
  const dragged = useRef(false);
  const tilt = useRef({ x: 0, y: 0 });
  const pour = useRef({ want: null, showing: null });
  const focusNext = useRef(null);
  const raf = useRef(0);
  const last = useRef(0);
  const frameRef = useRef(null);

  const wake = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame((t) => frameRef.current(t));
  }, []);

  /* where everything's headed when nobody's holding the menu */
  const goal = () => {
    const m = mode.current;
    const Lc = L.current;
    if (m.open) {
      return { x: Lc.vw / 2, y: Lc.vh / 2, s: 1, r: OPEN_TILT, rx: tilt.current.y, ry: tilt.current.x, lift: 0.7 };
    }
    const R = rest.current;
    return {
      x: R.x,
      y: R.y + (m.hidden ? 70 : 0),
      s: Lc.rest * (m.hover ? 1.04 : 1),
      r: R.r,
      rx: 0,
      ry: 0,
      lift: m.hover ? 0.35 : 0,
    };
  };

  const draw = () => {
    const st = sim.current;
    const Lc = L.current;
    const x = (st.x - Lc.W / 2).toFixed(2);
    const y = (st.y - Lc.H / 2).toFixed(2);
    if (card.current) {
      card.current.style.transform =
        `translate3d(${x}px, ${y}px, 0) perspective(${Math.round(Lc.W * st.s * 2.6)}px) ` +
        `rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg) rotate(${st.r.toFixed(2)}deg) scale(${st.s.toFixed(4)})`;
    }
    if (shadow.current) {
      /* lifted paper casts a softer shadow further away */
      const lift = clamp(st.lift, 0, 1);
      const w = Lc.W * st.s;
      shadow.current.style.transform =
        `translate3d(${(st.x - Lc.W / 2 + lift * w * 0.035).toFixed(2)}px, ${(st.y - Lc.H / 2 + lift * w * 0.08).toFixed(2)}px, 0) ` +
        `rotate(${st.r.toFixed(2)}deg) scale(${st.s.toFixed(4)})`;
      shadow.current.firstChild.style.opacity = (1 - lift).toFixed(3);
      shadow.current.lastChild.style.opacity = lift.toFixed(3);
    }
    liquid.current?.setAttribute(
      "transform",
      `translate(0 ${st.fill.toFixed(1)}) rotate(${st.slosh.toFixed(2)} ${CUP.pivot[0]} ${CUP.pivot[1]})`
    );
  };

  const frame = (now) => {
    raf.current = 0;
    const st = sim.current;
    const m = mode.current;
    const Lc = L.current;
    const dt = clamp(last.current ? (now - last.current) / 1000 : 1 / 60, 1 / 240, 1 / 30);
    last.current = now;
    const g = goal();
    const d = drag.current?.active ? drag.current : null;
    const p = pour.current;
    const n = Math.ceil(dt * 120);
    const h = dt / n;

    for (let i = 0; i < n; i++) {
      if (d) {
        /* held: the grabbed spot stays under the pointer while the paper
           swings about it, its far side trailing behind your hand */
        if (now - d.at > 40) {
          const fade = Math.exp(-14 * h);
          d.vx *= fade;
          d.vy *= fade;
        }
        let s = Lc.rest * 1.06;
        if (d.fromOpen) {
          /* pulled away from the middle, it shrinks toward lying-down size */
          const t = clamp(Math.hypot(d.px - Lc.vw / 2, d.py - Lc.vh / 2) / 320, 0, 1);
          s = 1 + (Math.max(s, 0.45) - 1) * t * t * (3 - 2 * t);
        }
        const swing = m.calm ? 0 : clamp(((-d.gy * d.vx + d.gx * d.vy) / (Lc.H / 2)) * 0.014, -16, 16);
        spring(st, "s", s, h, m.calm);
        spring(st, "r", d.base + swing, h, m.calm);
        spring(st, "rx", m.calm ? 0 : clamp(d.vy * 0.006, -14, 14), h, m.calm);
        spring(st, "ry", m.calm ? 0 : clamp(-d.vx * 0.006, -14, 14), h, m.calm);
        spring(st, "lift", 1, h, m.calm);
        const c = Math.cos(rad(st.r));
        const sn = Math.sin(rad(st.r));
        const gx = d.gx * st.s;
        const gy = d.gy * st.s;
        st.x = d.px - (gx * c - gy * sn);
        st.y = d.py - (gx * sn + gy * c);
        st.v.x = 0;
        st.v.y = 0;
      } else if (slide.current) {
        /* flung: it skids to a stop, bouncing off the screen's edges */
        const sl = slide.current;
        const b = bounds(Lc);
        const friction = Math.exp(-4.2 * h);
        st.v.x *= friction;
        st.v.y *= friction;
        sl.vr *= Math.exp(-3 * h);
        st.x += st.v.x * h;
        st.y += st.v.y * h;
        st.r += sl.vr * h;
        st.v.r = sl.vr; // so the spring carries on smoothly once it stops
        if (st.x < b.x0 || st.x > b.x1) {
          st.x = clamp(st.x, b.x0, b.x1);
          st.v.x *= -0.35;
          sl.vr *= -0.6;
        }
        if (st.y < b.y0 || st.y > b.y1) {
          st.y = clamp(st.y, b.y0, b.y1);
          st.v.y *= -0.35;
          sl.vr *= -0.6;
        }
        for (const k of ["s", "rx", "ry", "lift"]) spring(st, k, g[k], h, m.calm);
        if (Math.hypot(st.v.x, st.v.y) < 24 && Math.abs(sl.vr) < 8) {
          slide.current = null;
          /* it stays however it landed (within reason) */
          rest.current = { x: st.x, y: st.y, r: clamp(st.r, -14, 14), moved: true };
          st.v.x = 0;
          st.v.y = 0;
        }
      } else {
        for (const k of PAPER) spring(st, k, g[k], h, m.calm);
      }

      /* the drink stays level as the paper turns, and sloshes when the
         paper speeds up or slows down */
      if (m.calm) {
        st.slosh = 0;
        st.v.slosh = 0;
      } else {
        const level = -(st.r - (d ? d.base : g.r));
        spring(st, "slosh", clamp(level + clamp(st.ax * 0.0012, -18, 18), -24, 24), h, false);
      }

      /* pouring: drain whatever's in the cup (it's out of sight a little
         before it's all the way down), then pour the new order in */
      if (p.want !== p.showing) {
        if (p.showing && st.fill < CUP.empty - 30) {
          spring(st, "fill", CUP.empty, h, false, SPRINGS.drain);
        } else {
          p.showing = p.want;
          if (p.showing) drink.current?.setAttribute("fill", `url(#cafe-menu-drink-${p.showing})`);
          st.fill = CUP.empty;
          st.v.fill = 0;
          if (p.showing && !m.calm) st.v.slosh += 35;
        }
      } else {
        spring(st, "fill", p.showing ? 0 : CUP.empty, h, m.calm);
      }
    }

    /* the paper's sideways acceleration, which is what sloshes the drink */
    const vx = (st.x - st.lastX) / dt;
    st.ax = st.ax * 0.6 + clamp((vx - st.lastVx) / dt, -40000, 40000) * 0.4;
    st.lastX = st.x;
    st.lastVx = vx;

    const fillGoal = p.showing ? 0 : CUP.empty;
    const settled =
      !d &&
      !slide.current &&
      p.want === p.showing &&
      PAPER.every((k) => Math.abs(g[k] - st[k]) < EPS[k] && Math.abs(st.v[k]) < EPS[k] * 4) &&
      Math.abs(st.slosh - (m.calm ? 0 : -(st.r - g.r))) < EPS.slosh &&
      Math.abs(st.v.slosh) < EPS.slosh * 4 &&
      Math.abs(st.fill - fillGoal) < EPS.fill &&
      Math.abs(st.v.fill) < EPS.fill * 4;

    if (settled) {
      for (const k of PAPER) {
        st[k] = g[k];
        st.v[k] = 0;
      }
      st.slosh = 0;
      st.v.slosh = 0;
      st.fill = fillGoal;
      st.v.fill = 0;
      st.ax = 0;
      st.lastVx = 0;
      last.current = 0;
    }
    draw();
    if (!settled) wake();
  };
  frameRef.current = frame;

  /* settle a resting spot, kept on screen */
  const place = (x, y) => {
    const b = bounds(L.current);
    rest.current = { x: clamp(x, b.x0, b.x1), y: clamp(y, b.y0, b.y1), r: rest.current.r, moved: true };
  };

  const openMenu = (byKey) => {
    const m = mode.current;
    if (m.open || m.hidden) return;
    m.open = true;
    slide.current = null;
    focusNext.current = byKey ? "first" : null;
    if (!m.calm) sim.current.v.rx -= 140; // tips toward you as it comes up
    setOpen(true);
    onOpen?.();
    wake();
  };

  const closeMenu = useCallback(
    (refocus) => {
      if (!mode.current.open) return;
      mode.current.open = false;
      tilt.current = { x: 0, y: 0 };
      setOpen(false);
      if (refocus) requestAnimationFrame(() => pickup.current?.focus({ preventScroll: true }));
      wake();
    },
    [wake]
  );

  /* let go of a drag: put it down where it is, or fling it */
  const letGo = (d) => {
    const st = sim.current;
    const Lc = L.current;
    const m = mode.current;
    const speed = m.calm ? 0 : Math.hypot(d.vx, d.vy);
    if (m.open) {
      if (Math.hypot(st.x - Lc.vw / 2, st.y - Lc.vh / 2) < PUT_DOWN_AT && speed < THROW_AT) {
        wake(); // back to the middle, still reading
        return;
      }
      /* put down: it shrinks toward the hand that's holding it */
      const c = Math.cos(rad(st.r));
      const sn = Math.sin(rad(st.r));
      const gx = d.gx * Lc.rest;
      const gy = d.gy * Lc.rest;
      place(d.px - (gx * c - gy * sn), d.py - (gx * sn + gy * c));
      closeMenu(false);
    } else {
      place(st.x, st.y);
    }
    if (speed > THROW_AT) {
      const k = Math.min(1, 3200 / speed);
      slide.current = { vr: clamp(((-d.gy * d.vx + d.gx * d.vy) / (Lc.H / 2)) * 0.06 * k, -260, 260) };
      st.v.x = d.vx * k;
      st.v.y = d.vy * k;
    }
    wake();
  };

  const onPointerDown = (e) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || mode.current.hidden) return;
    const st = sim.current;
    const c = Math.cos(rad(-st.r));
    const sn = Math.sin(rad(-st.r));
    const dx = e.clientX - st.x;
    const dy = e.clientY - st.y;
    dragged.current = false;
    drag.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      px: e.clientX,
      py: e.clientY,
      at: e.timeStamp,
      vx: 0,
      vy: 0,
      /* the grabbed spot, in the unturned, full-size paper's own coordinates */
      gx: (dx * c - dy * sn) / st.s,
      gy: (dx * sn + dy * c) / st.s,
      active: false,
      fromOpen: mode.current.open,
      base: mode.current.open ? OPEN_TILT : rest.current.r,
    };
  };

  const letGoRef = useRef(letGo);
  letGoRef.current = letGo;

  /* follow the pointer anywhere once it's pressed on the menu */
  useEffect(() => {
    const move = (e) => {
      const d = drag.current;
      if (d && e.pointerId === d.id) {
        const dt = Math.max((e.timeStamp - d.at) / 1000, 1 / 240);
        d.vx = d.vx * 0.55 + clamp((e.clientX - d.px) / dt, -6000, 6000) * 0.45;
        d.vy = d.vy * 0.55 + clamp((e.clientY - d.py) / dt, -6000, 6000) * 0.45;
        d.px = e.clientX;
        d.py = e.clientY;
        d.at = e.timeStamp;
        if (!d.active && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > DRAG_FROM) {
          d.active = true;
          dragged.current = true;
          slide.current = null;
          setDragging(true);
        }
        if (d.active) wake();
        return;
      }
      /* held up and read, it leans a little toward the pointer */
      const m = mode.current;
      if (m.open && !m.calm && e.pointerType === "mouse") {
        const st = sim.current;
        const Lc = L.current;
        tilt.current = {
          x: clamp((e.clientX - st.x) / (Lc.W / 2), -1, 1) * 5,
          y: -clamp((e.clientY - st.y) / (Lc.H / 2), -1, 1) * 4,
        };
        wake();
      }
    };
    const up = (e) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      drag.current = null;
      if (!d.active) return; // just a click: the buttons take it from here
      setDragging(false);
      letGoRef.current(d);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [wake]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && mode.current.open) closeMenu(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu]);

  useEffect(() => {
    const onResize = () => {
      const next = measure();
      sim.current.s *= L.current.W / next.W; // same size on screen; it springs to the new one
      L.current = next;
      if (rest.current.moved) place(rest.current.x, rest.current.y);
      else rest.current = homeSpot(next);
      setLayout(next);
      wake();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [wake]);

  useEffect(() => {
    mode.current.hidden = hidden;
    if (hidden) {
      closeMenu(false);
      drag.current = null;
      slide.current = null;
      setDragging(false);
    }
    wake();
  }, [hidden, closeMenu, wake]);

  useEffect(() => {
    mode.current.calm = reducedMotion;
    wake();
  }, [reducedMotion, wake]);

  /* the latest drink ordered is the one in the cup */
  useEffect(() => {
    pour.current.want = [...ordered].reverse().find((id) => DRINKS[id]) ?? null;
    wake();
  }, [ordered, wake]);

  /* keyboard users land on the face that's showing */
  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (!open || !target) return;
    const face = flipped ? back.current : front.current;
    face?.querySelector(target === "first" ? "button" : ".cafe-menu-corner")?.focus({ preventScroll: true });
  }, [open, flipped]);

  useLayoutEffect(draw, [layout]);
  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    },
    []
  );

  const flip = (e) => {
    focusNext.current = e.detail === 0 ? "corner" : null;
    if (!mode.current.calm) {
      sim.current.v.s += 0.5 * sim.current.s; // a little hop as it turns
      sim.current.v.lift += 2;
    }
    setFlipped((f) => !f);
    wake();
  };

  const toggle = useCallback(
    (id) => setOrdered((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id])),
    []
  );

  const pick = (id) => {
    closeMenu(false);
    onHover(null);
    onSelect(id);
  };

  const setHovering = (on) => {
    mode.current.hover = on;
    setHover(on);
    wake();
  };

  const layer = ["cafe-menu-layer", open && "is-open", hidden && "is-hidden", dragging && "is-dragging"];
  const paper = ["cafe-menu", flipped && "is-flipped", hover && !open && !dragging && "is-hover"];

  return (
    <div className={layer.filter(Boolean).join(" ")}>
      <div className="cafe-menu-backdrop" onClick={() => closeMenu(false)} />
      <div ref={shadow} className="cafe-menu-shadow" style={{ width: layout.W, height: layout.H }} aria-hidden="true">
        <span className="cafe-menu-shadow-contact" />
        <span className="cafe-menu-shadow-air" />
      </div>
      <nav
        ref={card}
        className={paper.filter(Boolean).join(" ")}
        aria-label="Café menu"
        style={{ width: layout.W, height: layout.H, fontSize: layout.W / 25, "--rest-s": layout.rest }}
        onPointerDown={onPointerDown}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onClickCapture={(e) => {
          /* a drag that ends over a button isn't a click on it (keyboard
             clicks, detail 0, always go through) */
          if (!dragged.current || e.detail === 0) return;
          dragged.current = false;
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div className="cafe-menu-flipper">
          <div ref={front} className="cafe-menu-face cafe-menu-front" inert={!open || flipped ? "" : undefined}>
            <MenuFront ordered={ordered} onToggle={toggle} liquidRef={liquid} drinkRef={drink} />
            <Corner label="turn over" onFlip={flip} />
          </div>
          <div ref={back} className="cafe-menu-face cafe-menu-back" inert={!open || !flipped ? "" : undefined}>
            <MenuBack focused={focused} onHover={onHover} onPick={pick} />
            <Corner label="turn back" onFlip={flip} />
          </div>
        </div>
        {!open && (
          <button
            ref={pickup}
            type="button"
            className="cafe-menu-pickup"
            aria-label="Pick up the menu"
            onClick={(e) => openMenu(e.detail === 0)}
          />
        )}
        <span className="cafe-menu-tip" aria-hidden="true">
          click to read ✦ drag to move
        </span>
      </nav>
      <p className="cafe-menu-help" aria-hidden="true">
        click outside, or drag it away, to put it down
      </p>
    </div>
  );
}
