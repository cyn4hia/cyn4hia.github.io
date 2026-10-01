import { useEffect, useRef, useState } from "react";
import images from "../../assets/images";
import { ABOUT, CONTACT, INTERESTS, PORTFOLIO } from "../content";
import { DiscordCard, GitHubCard, LinkedInCard } from "./ProfileCards";

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

/* empty glasses: my email up top, then the LinkedIn, GitHub and Discord cards */
export function ContactCards() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    navigator.clipboard
      ?.writeText(CONTACT.email)
      .then(() => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  return (
    <>
      <div className="cafe-contact-email">
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        <button type="button" onClick={copy}>
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <p className="cafe-contact-label">find me on</p>
      <div className="cafe-contact-cards">
        <LinkedInCard delay={250} />
        <GitHubCard delay={350} />
        <DiscordCard delay={450} />
      </div>
      <p className="cafe-contact-signoff">{CONTACT.signoff}</p>
    </>
  );
}

/* loose stats, the way the portfolio shows them: rounded down to a clean
   half-step with a "+" (38M -> "35M+", 2200 -> "2K+") */
function approx(n) {
  if (n <= 0) return "0";
  const step = Math.pow(10, Math.floor(Math.log10(n))) / 2;
  const v = Math.floor(n / step) * step;
  const [div, unit] = v >= 1e6 ? [1e6, "M"] : v >= 1e3 ? [1e3, "K"] : [1, ""];
  const x = v / div;
  return `${x >= 100 ? Math.round(x) : Math.round(x * 10) / 10}${unit}+`;
}

/* electric kettle: my content portfolio, with every clip and reel opening
   straight to it on the full site */
export function PortfolioReel() {
  const { url, account, stats } = PORTFOLIO;
  return (
    <>
      <div className="cafe-reel-profile">
        <img className="cafe-reel-avatar" src={images.portfolioAvatar} alt="" />
        <div>
          <p className="cafe-reel-handle">
            {PORTFOLIO.handle}
            <span aria-label="verified">✓</span>
          </p>
          <p className="cafe-reel-account">{PORTFOLIO.name}</p>
        </div>
      </div>
      <dl className="cafe-reel-stats">
        {Object.entries(stats).map(([label, n]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{approx(n)}</dd>
          </div>
        ))}
      </dl>
      <p className="cafe-reel-bio">
        {PORTFOLIO.bio} · worked with <b>{PORTFOLIO.brands.join(", ")}</b>
      </p>
      <ul className="cafe-reel-tags">
        {PORTFOLIO.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <p className="cafe-reel-label">featured</p>
      <ul className="cafe-reel-grid">
        {PORTFOLIO.featured.map((clip, i) => (
          <li key={clip.title}>
            <a
              className="cafe-reel-clip"
              href={`${url}#/a/${account}/${i}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ "--i": i, "--tilt": `${i % 2 ? 1.2 : -1}deg` }}
            >
              <span className="cafe-reel-thumb">
                <img src={images[clip.cover]} alt="" />
                <span className="cafe-reel-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="cafe-reel-dur">{clip.duration}</span>
              </span>
              <span className="cafe-reel-title">{clip.title}</span>
              <span className="cafe-reel-views">▶ {approx(clip.views)} views</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="cafe-reel-label">collections</p>
      <ul className="cafe-reel-collections">
        {PORTFOLIO.collections.map((col) => (
          <li key={col.id}>
            <a
              className="cafe-reel-collection"
              href={`${url}#/a/${account}/c/${encodeURIComponent(col.id)}/0`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="cafe-reel-collection-name">{col.label}</span>
              <span className="cafe-reel-collection-count">{String(col.clips).padStart(2, "0")} clips</span>
            </a>
          </li>
        ))}
      </ul>

      <a className="cafe-cta cafe-reel-cta" href={url} target="_blank" rel="noopener noreferrer">
        open the full portfolio <span aria-hidden="true">↗</span>
      </a>
    </>
  );
}
