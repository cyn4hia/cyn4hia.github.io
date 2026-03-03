import { useState } from "react";

/**
 * A hoverable card displaying a single interest/hobby.
 */
export default function InterestCard({ emoji, title, desc }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "32px 28px",
        textAlign: "center",
        border: "1px solid rgba(141,184,96,0.1)",
        boxShadow: hovered
          ? "0 16px 48px rgba(141,184,96,0.1)"
          : "0 1px 8px rgba(0,0,0,0.03)",
        transform: hovered
          ? "translateY(-6px) scale(1.02)"
          : "translateY(0) scale(1)",
        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 14 }}>{emoji}</div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          color: "var(--text-dark)",
          fontWeight: 500,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--text-light)",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {desc}
      </p>
    </div>
  );
}
