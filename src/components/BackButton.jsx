import { useState } from "react";

/**
 * Circular back arrow fixed in the top-left.
 * Used on every sub-page to return to the landing page.
 */
export default function BackButton({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Back to home"
      style={{
        position: "fixed",
        top: 32,
        left: 32,
        zIndex: 50,
        background: hovered
          ? "rgba(141,184,96,0.15)"
          : "rgba(141,184,96,0.08)",
        border: "1.5px solid rgba(141,184,96,0.25)",
        borderRadius: "50%",
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: hovered ? "scale(1.08)" : "scale(1)",
        fontFamily: "var(--font-display)",
        fontSize: 22,
        color: "var(--grape-dark)",
      }}
    >
      {"\u2190"}
    </button>
  );
}
