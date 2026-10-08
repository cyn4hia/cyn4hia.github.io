import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS, ITEM_BY_ID } from "../cafe/config";
import { loadCafeScene } from "../cafe/loadScene";
import Annotations from "../cafe/ui/Annotations";
import MenuCard from "../cafe/ui/MenuCard";
import FocusPanel from "../cafe/ui/FocusPanel";
import "../cafe/ui/cafe.css";

const NARROW = 760;
/* mirrors .cafe-panel in cafe.css: the note is --note-w wide and centred
   around 68% of the screen width (never closer than 20px to the edge) */
const NOTE_W = 540;
/* narrower notes: the projects receipt and the slim contact note */
const NOTE_W_BY_CONTENT = { receipt: 470, contact: 440 };
const noteBox = (vw, w) => {
  const width = Math.min(w, vw - 40);
  const right = Math.max(20, 0.32 * vw - w / 2);
  return { width, right, free: vw - right - width }; // free: room left of the note
};

/* if WebGL is unavailable the menu card still gets you everywhere */
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

/**
 * Home: a little home café. The 3D table fills the screen; everything on
 * it is clickable. Picking something up zooms in on it and slides in a
 * note card with the way into that part of the site.
 */
export default function HomePage({ active = true, play = true, onReady }) {
  const [Scene, setScene] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const [intro, setIntro] = useState(false);
  const [touched, setTouched] = useState(false);
  const [settled, setSettled] = useState(false); // every item has popped in
  const labelRefs = useRef({});
  const reducedMotion = usePrefersReducedMotion();
  const vp = useViewport();

  useEffect(() => {
    let alive = true;
    loadCafeScene().then((m) => alive && setScene(() => m.default));
    return () => {
      alive = false;
    };
  }, []);

  /* first visit: the sketch's labels draw themselves on, then step aside */
  useEffect(() => {
    if (!play) return undefined;
    const show = setTimeout(() => setIntro(true), reducedMotion ? 150 : 1900);
    const hide = setTimeout(() => setIntro(false), reducedMotion ? 4000 : 6600);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [play, reducedMotion]);

  const hover = useCallback((id) => {
    setHovered(id);
    if (id) {
      setTouched(true);
      setIntro(false);
    }
  }, []);
  const select = useCallback((id) => {
    setFocused(id);
    setTouched(true);
    setIntro(false);
  }, []);
  const back = useCallback(() => setFocused(null), []);
  const readMenu = useCallback(() => {
    setTouched(true);
    setIntro(false);
  }, []);
  const settle = useCallback(() => setSettled(true), []);
  const step = useCallback((dir) => {
    setTouched(true);
    setIntro(false);
    setFocused((cur) => {
      const i = ITEMS.findIndex((it) => it.id === cur);
      if (i < 0) return ITEMS[dir > 0 ? 0 : ITEMS.length - 1].id;
      return ITEMS[(i + dir + ITEMS.length) % ITEMS.length].id;
    });
  }, []);
  const open = useCallback((item) => {
    if (item.href) window.open(item.href, "_blank", "noopener,noreferrer");
  }, []);

  /* ← → wander the table, esc steps back (only while home is showing) */
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Escape") {
        setFocused(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, step]);

  const narrow = vp.w <= NARROW;
  /* shift the focused item into the free space beside the note, and pull
     the camera back a touch when that space is tight so it stays in view */
  const noteW = NOTE_W_BY_CONTENT[focused && ITEM_BY_ID[focused]?.content] ?? NOTE_W;
  const panelInset = useMemo(() => {
    if (narrow) return { x: 0, y: Math.round(vp.h * 0.21), zoom: 1 };
    const note = noteBox(vp.w, noteW);
    return {
      x: Math.round((note.right + note.width) / 2),
      y: 0,
      zoom: Math.min(1.4, Math.max(1, (0.62 * vp.w) / note.free)),
    };
  }, [narrow, vp.w, vp.h, noteW]);

  /* no arrows while things are still dropping onto the table: a hover
     mid-intro waits until everything has landed */
  const visibleIds = useMemo(() => {
    if (focused || !settled) return new Set();
    if (intro) return new Set(ITEMS.map((it) => it.id));
    return new Set(hovered ? [hovered] : []);
  }, [focused, intro, hovered, settled]);

  return (
    <main
      className={`cafe${hovered ? " is-hovering" : ""}${focused ? " is-focused" : ""}`}
      aria-label="Cindy's little home café"
    >
      {Scene ? (
        <SceneBoundary onFail={onReady}>
          <Scene
            hovered={hovered}
            focused={focused}
            play={play}
            paused={!active}
            reducedMotion={reducedMotion}
            panelInset={panelInset}
            labelRefs={labelRefs}
            onHover={hover}
            onSelect={select}
            onBackground={back}
            onReady={onReady}
            onSettled={settle}
          />
        </SceneBoundary>
      ) : (
        <div className="cafe-loading">brewing…</div>
      )}
      <div className="cafe-vignette" />
      <div className="cafe-grain" />

      <Annotations labelRefs={labelRefs} visibleIds={visibleIds} />

      <header className={`cafe-title${focused ? " is-hidden" : ""}`}>
        <h1>Cindy&rsquo;s</h1>
        <p>
          little home café
          <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M2 8 C 40 2, 70 11, 104 6 S 170 3, 198 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="cafe-sparkle" style={{ right: -26, top: -10, fontSize: 22 }}>
            ✦
          </span>
          <span className="cafe-sparkle" style={{ right: -40, top: 12, fontSize: 13, animationDelay: "0.9s" }}>
            ✦
          </span>
        </p>
      </header>

      <MenuCard
        hidden={Boolean(focused)}
        focused={focused}
        reducedMotion={reducedMotion}
        onHover={hover}
        onSelect={select}
        onOpen={readMenu}
      />

      <div className={`cafe-hint${touched || focused || !play ? " is-hidden" : ""}`}>
        ✦ click anything on the table ✦
      </div>

      <FocusPanel
        item={focused ? ITEM_BY_ID[focused] : null}
        onOpen={open}
        onClose={back}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
      />
    </main>
  );
}
