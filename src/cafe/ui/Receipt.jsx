import { PROJECTS, RECEIPT } from "../content";

const money = (n) => `$${n.toFixed(2)}`;

/**
 * The chawan's projects, rung up as a café receipt. Every project with a
 * link is clickable; the rest are still in the oven.
 */
export default function Receipt({ nav }) {
  const now = new Date();
  const date = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const subtotal = PROJECTS.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="cafe-receipt">
      <header className="cafe-receipt-head">
        <p className="cafe-receipt-cafe">cindy&rsquo;s little home café</p>
        <h2>{RECEIPT.title}</h2>
        <p className="cafe-receipt-sub">{RECEIPT.subtitle}</p>
      </header>
      <div className="cafe-receipt-row">
        <span>DATE: {date}</span>
        <span>TIME: {time}</span>
      </div>
      <div className="cafe-receipt-row">
        <span>ORDER #: {RECEIPT.order}</span>
        <span>TABLE 1</span>
      </div>
      <hr />
      <div className="cafe-receipt-row is-cols">
        <span>ITEM</span>
        <span>PRICE</span>
      </div>
      <hr />
      <ul className="cafe-receipt-items">
        {PROJECTS.map((p) => {
          const body = (
            <>
              <span className="cafe-receipt-line">
                <span className="cafe-receipt-name">{p.name}</span>
                <span className="cafe-receipt-dots" aria-hidden="true" />
                <span>{money(p.price)}</span>
              </span>
              <span className="cafe-receipt-desc">{p.desc}</span>
              <span className="cafe-receipt-tags">
                {p.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </span>
            </>
          );
          return (
            <li key={p.name}>
              {p.link ? (
                <a href={p.link} target="_blank" rel="noopener noreferrer">
                  {body}
                </a>
              ) : (
                <div>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <hr />
      <div className="cafe-receipt-row">
        <span>SUBTOTAL ({PROJECTS.length} items)</span>
        <span>{money(subtotal)}</span>
      </div>
      <div className="cafe-receipt-row">
        <span>TAX</span>
        <span>{RECEIPT.tax}</span>
      </div>
      <hr />
      <div className="cafe-receipt-row is-total">
        <span>TOTAL</span>
        <span>{RECEIPT.total}</span>
      </div>
      <hr />
      <p className="cafe-receipt-thanks">{RECEIPT.thanks}</p>
      <a className="cafe-receipt-foot" href={RECEIPT.footerLink} target="_blank" rel="noopener noreferrer">
        {RECEIPT.footer}
      </a>
      <div className="cafe-receipt-barcode" aria-hidden="true" />
      {nav}
    </div>
  );
}
