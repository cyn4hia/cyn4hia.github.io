import { ITEMS } from "../config";

/**
 * The café menu doubles as plain navigation: every item on the table is
 * listed with where it leads. Hovering a line lifts that item in 3D.
 */
export default function MenuCard({ hidden, focused, onHover, onSelect }) {
  return (
    <nav className={`cafe-menu${hidden ? " is-hidden" : ""}`} aria-label="On the table">
      <h2>
        menu <span>today</span>
      </h2>
      <ul>
        {ITEMS.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              className={focused === it.id ? "is-active" : ""}
              onMouseEnter={() => onHover(it.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(it.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(it.id)}
            >
              <span className="cafe-menu-name">{it.label}</span>
              <span className="cafe-menu-dots" aria-hidden="true" />
              <span className="cafe-menu-dest">{it.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
