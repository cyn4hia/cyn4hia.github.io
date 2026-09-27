import { ABOUT, INTERESTS } from "../content";

/* matcha tools: a few things about me, each with a handwritten label */
export function AboutFacts() {
  return (
    <ul className="cafe-facts">
      {ABOUT.map((fact) => (
        <li key={fact.label}>
          <span className="cafe-fact-label">{fact.label}</span>
          <p className="cafe-fact-detail">{fact.detail}</p>
          <p className="cafe-fact-sub">{fact.subtext}</p>
        </li>
      ))}
    </ul>
  );
}

/* matcha tin: interests, written up as the blend's ingredient list */
export function InterestBlend() {
  return (
    <>
      <p className="cafe-blend-label">ingredients</p>
      <ol className="cafe-blend">
        {INTERESTS.map((it, i) => (
          <li key={it.label}>
            <span className="cafe-blend-num">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="cafe-blend-name">{it.label}</span>
              <span className="cafe-blend-detail">{it.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
