import { useEffect, useRef, useState } from "react";
import { crumple } from "./crumple";
import { AboutFacts, InterestBlend } from "./NoteContent";
import Receipt from "./Receipt";

/* items whose content lives right on the note (see `content` in config) */
const BODIES = { about: AboutFacts, interests: InterestBlend };

/**
 * The note that slides in beside a focused item. It either holds that
 * part of the site itself (about, interests, the projects receipt) or
 * offers the way in (contact, mind). Keeps rendering the last item while
 * it animates out so the note doesn't blank mid-exit. The ✕ crumples it
 * into a ball and tosses it; other exits (esc, clicking away) slide.
 */
export default function FocusPanel({ item, onOpen, onClose, onPrev, onNext }) {
  const [shown, setShown] = useState(item);
  const [leaving, setLeaving] = useState(false);
  const [round, setRound] = useState(0); // a fresh note every time something's picked up
  const cta = useRef(null);
  const panel = useRef(null);
  const crumpling = useRef(null);
  const latest = useRef(item);
  latest.current = item;

  useEffect(() => {
    if (item) {
      crumpling.current?.cancel();
      crumpling.current = null;
      setShown(item);
      setRound((n) => n + 1);
      setLeaving(false);
      return undefined;
    }
    if (!shown || crumpling.current) return undefined; // a crumple runs its own exit
    setLeaving(true);
    const t = setTimeout(() => {
      setShown(null);
      setLeaving(false);
    }, 340);
    return () => clearTimeout(t);
  }, [item]);

  /* keyboard users land on the new note: its way in, or the note itself */
  useEffect(() => {
    if (latest.current && shown) (cta.current ?? panel.current)?.focus({ preventScroll: true });
  }, [shown, round]);

  const crumpleAway = () => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!panel.current || reduced || crumpling.current) {
      onClose();
      return;
    }
    const ball = crumple(panel.current);
    crumpling.current = ball;
    onClose(); // the camera heads back while the note balls up
    ball.finished.then(() => {
      if (crumpling.current !== ball) return;
      crumpling.current = null;
      if (!latest.current) setShown(null);
    });
  };

  if (!shown) return null;
  const Body = BODIES[shown.content];
  const isReceipt = shown.content === "receipt";
  const nav = (
    <div className="cafe-panel-nav">
      <button type="button" onClick={onPrev} aria-label="Previous item">
        ← prev
      </button>
      <span className="cafe-panel-drag">drag to turn it ⟲</span>
      <button type="button" onClick={onNext} aria-label="Next item">
        next →
      </button>
    </div>
  );

  return (
    <aside
      ref={panel}
      key={`${shown.id}-${round}`}
      tabIndex={-1}
      className={`cafe-panel${isReceipt ? " cafe-panel--receipt" : ""}${Body ? " cafe-panel--full" : ""}${leaving ? " is-leaving" : ""}`}
      aria-label={`${shown.label}: ${shown.title}`}
    >
      <button type="button" className="cafe-panel-close" onClick={crumpleAway} aria-label="Back to the table">
        ✕
      </button>
      {isReceipt ? (
        <Receipt nav={nav} />
      ) : (
        <>
          <div className="cafe-panel-kicker">{shown.label}</div>
          <h2>{shown.title}</h2>
          <div className="cafe-panel-tagline">{shown.tagline}</div>
          <div className="cafe-panel-body">
            {Body ? (
              <Body />
            ) : (
              <>
                <p className="cafe-panel-blurb">{shown.blurb}</p>
                <button ref={cta} type="button" className="cafe-cta" onClick={() => onOpen(shown)}>
                  {shown.cta} <span aria-hidden="true">{shown.href ? "↗" : "→"}</span>
                </button>
              </>
            )}
          </div>
          {nav}
        </>
      )}
    </aside>
  );
}
