import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ITEM_BY_ID } from "../config";
import images from "../../assets/images";

const CLOSE_DELAY = 280; // grace period to move the pointer from the corner card to the big one
/* menu order (not the table's left-to-right order): the two shortest
   lines go last, beside the bunny in the bottom-right corner */
const MENU = ["tools", "kettle", "glasses", "tin", "chawan"].map((id) => ITEM_BY_ID[id]);
const BY_BUNNY = 2;

/* one of Cindy's crayon doodles, tinted by CSS (they're used as masks) */
function Doodle({ src, className }) {
  return <span className={`cafe-doodle ${className}`} style={{ "--src": `url(${src})` }} aria-hidden="true" />;
}

/* the paper itself; sized in em, so the big copy is the same card enlarged */
function Sheet({ focused, onHover, onSelect, tabbable }) {
  return (
    <>
      <div className="cafe-menu-paper" aria-hidden="true" />
      <div className="cafe-menu-top">
        <Doodle src={images.menuCat} className="cafe-doodle--cat" />
        <h2 className="cafe-menu-logo">
          <span className="cafe-sr">Café Cindy</span>
          <Doodle src={images.menuLogo} className="cafe-doodle--logo" />
        </h2>
        <span className="cafe-menu-cup" aria-hidden="true">
          <span className="cafe-menu-matcha" />
          <Doodle src={images.menuCup} className="cafe-doodle--cup" />
        </span>
      </div>
      <p className="cafe-menu-heading">~ today&rsquo;s menu ~</p>
      <ul className="cafe-menu-list">
        {MENU.map((it, i) => (
          <li key={it.id} className={i >= MENU.length - BY_BUNNY ? "is-by-bunny" : undefined}>
            <button
              type="button"
              tabIndex={tabbable ? 0 : -1}
              className={focused === it.id ? "is-active" : ""}
              onMouseEnter={() => onHover(it.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(it.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(it.id)}
            >
              <span className="cafe-menu-star" aria-hidden="true">
                ★
              </span>
              <span className="cafe-menu-name">{it.label}</span>
              <span className="cafe-menu-dots" aria-hidden="true" />
              <span className="cafe-menu-dest">{it.title.toLowerCase()}</span>
            </button>
          </li>
        ))}
      </ul>
      <Doodle src={images.menuBunny} className="cafe-doodle--bunny" />
    </>
  );
}

/**
 * The café menu in the corner doubles as plain navigation: every item on
 * the table, and where it leads. Hovering the card grows it out of its
 * corner into an enlarged copy in the middle of the screen (tap on touch);
 * hovering a line lifts that item on the table.
 */
export default function MenuCard({ hidden, focused, onHover, onSelect }) {
  const [open, setOpen] = useState(false);
  const [byTap, setByTap] = useState(false);
  const small = useRef(null);
  const big = useRef(null);
  const timer = useRef(0);

  /* keep the big card parked exactly over the corner card while closed,
     so opening is one smooth grow from there to the centre */
  useLayoutEffect(() => {
    const park = () => {
      const s = small.current;
      const b = big.current;
      if (!s || !b) return;
      const r = s.getBoundingClientRect();
      const bx = b.offsetLeft + b.offsetWidth / 2;
      const by = b.offsetTop + b.offsetHeight / 2;
      b.style.setProperty("--from-x", `${(r.left + r.width / 2 - bx).toFixed(1)}px`);
      b.style.setProperty("--from-y", `${(r.top + r.height / 2 - by).toFixed(1)}px`);
      b.style.setProperty("--from-s", (s.offsetWidth / b.offsetWidth).toFixed(4));
    };
    park();
    document.fonts?.ready.then(park).catch(() => {});
    window.addEventListener("resize", park);
    return () => window.removeEventListener("resize", park);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  const show = (tap = false) => {
    clearTimeout(timer.current);
    setByTap(tap);
    setOpen(true);
  };
  const hideSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };
  const pick = (id) => {
    clearTimeout(timer.current);
    setOpen(false);
    onSelect(id);
  };

  return (
    <>
      <nav
        ref={small}
        className={`cafe-menu${hidden ? " is-hidden" : ""}${open ? " is-expanded" : ""}`}
        aria-label="Menu"
        onPointerEnter={(e) => e.pointerType !== "touch" && show()}
        onPointerLeave={(e) => e.pointerType !== "touch" && hideSoon()}
        onClick={(e) => {
          /* touch: tapping the card (not a line) opens the big menu */
          if (!e.target.closest("button")) show(true);
        }}
      >
        <Sheet focused={focused} onHover={onHover} onSelect={pick} tabbable />
      </nav>

      <div className={`cafe-menu-stage${open ? " is-open" : ""}${byTap ? " by-tap" : ""}`}>
        <div className="cafe-menu-backdrop" onClick={() => setOpen(false)} />
        <div
          ref={big}
          className="cafe-menu cafe-menu--big"
          aria-hidden="true"
          onPointerEnter={(e) => e.pointerType !== "touch" && show()}
          onPointerLeave={(e) => e.pointerType !== "touch" && hideSoon()}
        >
          <Sheet focused={focused} onHover={onHover} onSelect={pick} tabbable={false} />
        </div>
      </div>
    </>
  );
}
