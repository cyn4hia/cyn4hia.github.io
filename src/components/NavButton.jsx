import { useState, useEffect } from "react";

/**
 * A single navigation button on the landing page.
 * Shows label + grape image + subtitle, with hover and entrance animations.
 */
export default function NavButton({
  label,
  subtitle,
  imgSrc,
  imgW = 40,
  imgH = 40,
  onClick,
  delay = 0,
}) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "12px 20px",
        borderRadius: 16,
        transform: visible
          ? hovered
            ? "translateY(-8px) scale(1.05)"
            : "translateY(0) scale(1)"
          : "translateY(30px) scale(0.95)",
        opacity: visible ? 1 : 0,
        transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 300,
            color: hovered ? "var(--grape-dark)" : "var(--text-main)",
            transition: "color 0.3s ease",
          }}
        >
          {label}
        </span>
        <img
          src={imgSrc}
          alt=""
          style={{
            width: imgW,
            height: imgH,
            objectFit: "contain",
            transition: "transform 0.3s ease",
            transform: hovered ? "rotate(-8deg) scale(1.1)" : "rotate(0)",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--text-light)",
          letterSpacing: 1,
          fontStyle: "italic",
        }}
      >
        {subtitle}
      </span>
    </button>
  );
}
