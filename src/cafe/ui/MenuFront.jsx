import { useState } from "react";
import images from "../../assets/images";
import { ART, BUNNY, CUP, DISHES, DRINKS } from "./menuArt";

const pct = (n, of) => `${((n / of) * 100).toFixed(3)}%`;
const PAD_X = 22;
const PAD_Y = 5;

/* a dish's hit area, a touch roomier than its lettering */
const spot = ([x0, y0, x1, y1]) => ({
  left: pct(x0 - PAD_X, ART.w),
  top: pct(y0 - PAD_Y, ART.h),
  width: pct(x1 - x0 + PAD_X * 2, ART.w),
  height: pct(y1 - y0 + PAD_Y * 2, ART.h),
});

const SECTIONS = ["Matcha", "Sweets"].map((name) => ({
  name,
  dishes: DISHES.filter((d) => d.section === name),
}));

/**
 * The front of the menu: Cindy's drawing, plus the bits that come alive
 * on top of it. Hovering a line sketches a loop around it and clicking
 * orders it (the loop stays, like circling it in pencil). Ordering a drink
 * pours it into the doodled cup; MenuCard drives the pour and the slosh
 * through `liquidRef`/`drinkRef`, since they follow the paper's motion.
 */
export default function MenuFront({ ordered, onToggle, liquidRef, drinkRef }) {
  const [hot, setHot] = useState(null);
  const [hearts, setHearts] = useState([]);

  const toggle = (id) => {
    if (!ordered.includes(id)) setHearts((h) => [...h.slice(-3), `${id}-${Date.now()}`]);
    onToggle(id);
  };

  return (
    <>
      <img className="cafe-menu-art" src={images.menu} alt="" draggable={false} />
      <h2 className="cafe-sr">Café Cindy: today&rsquo;s menu</h2>

      {/* the drink, painted in behind the cup's pencil lines */}
      <svg className="cafe-menu-wash" viewBox={`0 0 ${ART.w} ${ART.h}`} aria-hidden="true">
        <defs>
          <clipPath id="cafe-menu-cup">
            <path d={CUP.inside} />
          </clipPath>
          {Object.entries(DRINKS).map(([id, stops]) => (
            <linearGradient
              key={id}
              id={`cafe-menu-drink-${id}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={CUP.top}
              x2="0"
              y2={CUP.bottom}
            >
              {stops.map(([at, color]) => (
                <stop key={at} offset={at} stopColor={color} />
              ))}
            </linearGradient>
          ))}
        </defs>
        <g clipPath="url(#cafe-menu-cup)">
          <g ref={liquidRef} transform={`translate(0 ${CUP.empty})`}>
            <path ref={drinkRef} d={CUP.drink} className="cafe-menu-drink" />
            <path d={CUP.surface} className="cafe-menu-drink-edge" />
          </g>
        </g>
      </svg>

      {/* pencil marks over the art: order loops, and the bunny's blink */}
      <svg className="cafe-menu-ink" viewBox={`0 0 ${ART.w} ${ART.h}`} aria-hidden="true">
        {DISHES.map((d) => (
          <g
            key={d.id}
            className={`cafe-menu-loop${ordered.includes(d.id) ? " is-on" : ""}${hot === d.id ? " is-hot" : ""}`}
          >
            <path d={d.loop} pathLength="1" />
            <path d={d.loop2} pathLength="1" className="cafe-menu-loop-echo" />
          </g>
        ))}
        <g className="cafe-menu-blink">
          {BUNNY.eyes.map((e) => (
            <g key={e.cx}>
              <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} />
              <path d={e.lid} />
            </g>
          ))}
        </g>
      </svg>

      {SECTIONS.map((s) => (
        <ul key={s.name} className="cafe-menu-dishes" aria-label={s.name}>
          {s.dishes.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="cafe-menu-dish"
                style={spot(d.box)}
                aria-pressed={ordered.includes(d.id)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHot(d.id)}
                onPointerLeave={() => setHot(null)}
                onFocus={() => setHot(d.id)}
                onBlur={() => setHot(null)}
                onClick={() => toggle(d.id)}
              >
                <span className="cafe-sr">{d.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ))}

      {hearts.map((key) => (
        <svg
          key={key}
          className="cafe-menu-heart"
          viewBox="0 0 24 22"
          style={{ left: `${BUNNY.heart.x}%`, top: `${BUNNY.heart.y}%` }}
          aria-hidden="true"
          onAnimationEnd={() => setHearts((h) => h.filter((k) => k !== key))}
        >
          <path d="M12 21C9 18.8 1.5 14 1.5 7.6 1.5 4.3 4 2 6.9 2c2.2 0 3.9 1.3 5.1 3.1C13.2 3.3 14.9 2 17.1 2c2.9 0 5.4 2.3 5.4 5.6C22.5 14 15 18.8 12 21z" />
        </svg>
      ))}
    </>
  );
}
