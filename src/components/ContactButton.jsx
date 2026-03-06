import { useState, useEffect } from "react";

export default function ContactButton({
  imgSrc,
  imgW,
  imgH,
  onClick,
  delay = 0,
  imgY,
  imgX,
}) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
    style={{
        position: "absolute",
        right: imgX,
        bottom: imgY,
        animation: "gentle-float 6s ease-in-out infinite",
        animationDelay: "0s",
    }}
    >
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
        gap: 0,
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
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
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
    </button>
  </div>
  );
}
