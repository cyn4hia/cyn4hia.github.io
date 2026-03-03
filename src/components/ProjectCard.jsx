import { useState } from "react";

/**
 * A hoverable card that displays a single project.
 */
export default function ProjectCard({ title, desc, tags, link }) {
  const [hovered, setHovered] = useState(false);

  const card = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "36px 40px",
        marginBottom: 24,
        border: hovered
          ? "1px solid rgba(141,184,96,0.35)"
          : "1px solid rgba(141,184,96,0.12)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 40px rgba(141,184,96,0.1)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 26,
          color: "var(--text-dark)",
          fontWeight: 400,
          margin: "0 0 10px",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          color: "var(--text-light)",
          lineHeight: 1.7,
          margin: "0 0 16px",
        }}
      >
        {desc}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tags.map((t) => (
          <span
            key={t}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--grape-dark)",
              background: "rgba(141,184,96,0.1)",
              padding: "4px 14px",
              borderRadius: 20,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {card}
      </a>
    );
  }

  return card;
}
