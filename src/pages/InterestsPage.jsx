import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import images from "../assets/images";


const interests = [
  {
    label: "AI-Human Interaction",
    detail: "Exploring the dynamics of AI and human collaboration.",
  },
  {
    label: "Human-Computer Interaction",
    detail: "Designing intuitive interfaces that enhance user experience.",
  },
  {
    label: "Vision-Language Models",
    detail: "Interested in exploring VLMs.",
  },
  {
    label: "AI in Gaming",
    detail: "Interested in exploring the different ways AI can be applied in gaming.",
  },
  {
    label: "CS education",
    detail: "Making CS education more accessible to young students interested in the field.",
  },
  {
    label: "Design",
    detail: "UI/UX, creative coding, making things look pretty.",
  },
  {
    label: "Economics & Tech",
    detail: "The intersection between economic efficiency and technology",
  },
  {
    label: "Computer Vision",
    detail: "Interested in Computer Vision research and application",
  },
];

function SliceWedge({ rotation, angle, radius, z, color, bright, isTop, isClickable, shadow, hovered }) {
  const cx = 170, cy = 180;
  const halfAngle = (angle / 2) * (Math.PI / 180);
  const x1 = cx + radius * Math.cos(-halfAngle);
  const y1 = cy + radius * Math.sin(-halfAngle);
  const x2 = cx + radius * Math.cos(halfAngle);
  const y2 = cy + radius * Math.sin(halfAngle);
  const large = angle > 180 ? 1 : 0;
  const d = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${large} 1 ${x2},${y2} Z`;

  return (
    <svg
      width="340"
      height="360"
      viewBox="0 0 340 360"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: isClickable ? "auto" : "none",
        transform: `rotate(${rotation}deg) translateZ(${z}px)`,
        filter: shadow
          ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
          : bright ? "brightness(1.08)" : "none",
        transition: "filter 0.3s ease",
      }}
    >
      <path
        d={d}
        fill={color}
        stroke={hovered ? "rgba(84, 104, 13, 0.5)" : isTop ? "#e8dfc8" : "rgba(0,0,0,0.06)"}
        strokeWidth={hovered ? 2 : 0.8}
        style={{ transition: "stroke 0.2s ease, stroke-width 0.2s ease" }}
      />
    </svg>
  );
}

function CakeSlice({ index, sliceAngle, isActive, isHovered, onClick }) {
  const gap = 3;
  const drawAngle = sliceAngle - gap;
  const rotation = index * sliceAngle + gap / 2;
  const midAngle = ((rotation + drawAngle / 2) * Math.PI) / 180;
  const pullDist = isActive ? 50 : 0;
  const px = Math.cos(midAngle) * pullDist;
  const py = Math.sin(midAngle) * pullDist;

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        pointerEvents: "none",
        transformStyle: "preserve-3d",
        transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        transform: `translate(${px}px, ${py}px)`,
      }}
    >
      {/* bot layer */}
      <SliceWedge rotation={rotation} angle={sliceAngle} radius={120} z={0} color="#C0DDA2" bright={isActive} isClickable={false} />
      {/* frosting middle */}
      <SliceWedge rotation={rotation} angle={sliceAngle} radius={122} z={34} color="#FAF0E0" bright={isActive} isClickable={false} />
      {/* top layer */}
      <SliceWedge rotation={rotation} angle={sliceAngle} radius={120} z={42} color="#C0DDA2" bright={isActive} isClickable={false} />
      {/* top frost */}
      <SliceWedge rotation={rotation} angle={sliceAngle} radius={124} z={72} color="#84AA2C" bright={isActive} isTop isClickable hovered={isHovered} />
    </div>
  );
}

/* cake */
function Cake3D({ activeSlice, setActiveSlice }) {
  const [hoverSlice, setHoverSlice] = useState(null);
  const sliceCount = interests.length;
  const sliceAngle = 360 / sliceCount;
  const gap = 2;

  return (
    <div
      style={{
        width: 340,
        height: 360,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* 3d visual */}
      <div
        style={{
          perspective: 800,
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transform: "rotateX(52deg) rotateZ(-24deg)",
          }}
        >
          {/* Plate */}
          <div
            style={{
              position: "absolute",
              width: 350,
              height: 350,
              borderRadius: "50%",
              border: "10px solid rgba(0,0,0,0.1)",
              background: "radial-gradient(ellipse at 40% 40%, #d8d8d8, #b8b8b8 70%, #a0a0a0)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) translateZ(-6px)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          />

          {/* 3D Cake slices */}
          {interests.map((_, i) => (
            <CakeSlice
              key={i}
              index={i}
              sliceAngle={sliceAngle}
              isActive={activeSlice === i}
              isHovered={hoverSlice === i}
            />
          ))}
        </div>
      </div>

      {/* overlay on top */}
      <svg
        width={340}
        height={360}
        viewBox="0 0 340 360"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        {interests.map((_, i) => {
          const cx = 170, cy = 120;
          const rx = 140, ry = 82;
          const angleOffset = -45;
          const a1 = i * sliceAngle + angleOffset + 1/2;
          const a2 = (i + 1) * sliceAngle + angleOffset - 1/2 ;
          const steps = 30;
          const points = [`${cx},${cy}`];
          for (let s = 0; s <= steps; s++) {
            const a = ((a1 + (a2 - a1) * (s / steps)) * Math.PI) / 180;
            points.push(`${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`);
          }
          return (
            <polygon
              key={`click-${i}`}
              points={points.join(" ")}
              fill= "transparent"
              stroke="none"
              onMouseEnter={() => setHoverSlice(i)}
              onMouseLeave={() => setHoverSlice(null)}
              onClick={() => setActiveSlice(activeSlice === i ? null : i)}
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </svg>
      {/* Fork */}
      <svg
        width="60"
        height="200"
        viewBox="0 0 60 200"
        style={{
          position: "absolute",
          left: -70,
          rotate: "-20deg",
          bottom: 20,
          opacity: 0.45,
          pointerEvents: "none",
        }}
      >
        {/* handle */}
        <rect x="27" y="80" width="6" height="110" rx="3" fill="#b0b0b0" />
        <rect x="25" y="70" width="10" height="20" rx="3" fill="#b8b8b8" />
        {/* prick */}
        <rect x="12" y="10" width="5" height="65" rx="2" fill="#c0c0c0" />
        <rect x="22" y="6" width="5" height="68" rx="2" fill="#c0c0c0" />
        <rect x="33" y="6" width="5" height="68" rx="2" fill="#c0c0c0" />
        <rect x="43" y="10" width="5" height="65" rx="2" fill="#c0c0c0" />
        <rect x="12" y="50" width="36" height="35" rx="10" fill="#c0c0c0" />

        <ellipse cx="14.5" cy="10" rx="2.5" ry="3" fill="#c0c0c0" />
        <ellipse cx="24.5" cy="6" rx="2.5" ry="3" fill="#c0c0c0" />
        <ellipse cx="35.5" cy="6" rx="2.5" ry="3" fill="#c0c0c0" />
        <ellipse cx="45.5" cy="10" rx="2.5" ry="3" fill="#c0c0c0" />

        <rect x="29" y="90" width="2" height="80" rx="1" fill="rgba(255,255,255,0.4)" />
      </svg>

      {/* spoon */}
      <svg
        width="60"
        height="200"
        viewBox="0 0 60 200"
        style={{
          position: "absolute",
          right: -70,
          rotate: "20deg",
          bottom: 10,
          opacity: 0.45,
          pointerEvents: "none",
        }}
      >
        {/* handle */}
        <rect x="27" y="65" width="8" height="115" rx="3" fill="#b0b0b0" />
        {/* render */}
        <rect x="29" y="85" width="2" height="85" rx="1" fill="rgba(255,255,255,0.4)" />
        {/* scoop */}
        <ellipse cx="30" cy="38" rx="22" ry="34" fill="#c0c0c0" />
        <ellipse cx="28" cy="32" rx="14" ry="22" fill="rgba(220,220,220,0.6)" />
        <ellipse cx="24" cy="26" rx="6" ry="10" fill="rgba(255,255,255,0.35)" />
      </svg>
    </div>
  );
}

/* detail card */
function DetailCard({ interest, onClose }) {
  if (!interest) return null;
  return (
    <div
      key={interest.label}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "28px 32px",
        border: "1px solid rgba(139,34,82,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        maxWidth: 400,
        margin: "32px auto 0",
        position: "relative",
        animation: "cakeCardIn 0.4s ease forwards",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 26,
            fontWeight: 500,
            color: "#5a5a5a",
          }}
        >
          {interest.label}
        </span>
      </div>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: "#808080",
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        {interest.detail}
      </p>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          background: "none",
          border: "none",
          fontSize: 18,
          color: "#aaa",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    </div>
  );
}

/* general */
export default function InterestsPage({ onBack }) {
  const [activeSlice, setActiveSlice] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSlice((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % interests.length;
        });
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSlice((prev) => {
          if (prev === null) return interests.length - 1;
          return (prev - 1 + interests.length) % interests.length;
        });
      }
      if (e.key === "Escape") {
        setActiveSlice(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: "80px 40px 60px" }}>
      <BackButton onClick={onBack} />

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* header */}
        <FadeIn delay={200}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 48,
                  color: "#808080",
                  fontWeight: 300,
                }}
              >
                Cold
              </span>
              <img src={images.cold} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
            </div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: "#aaa",
                letterSpacing: 3,
                fontStyle: "italic",
              }}
            >
              Interests
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <p
            style={{
              textAlign: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#bbb",
              marginBottom: 8,
            }}
          >
            click a slice to pull it out or use ← → arrows
          </p>
        </FadeIn>

        {/* cake */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <Cake3D activeSlice={activeSlice} setActiveSlice={setActiveSlice} />
        </div>

        {/* info card */}
        <DetailCard
          interest={activeSlice !== null ? interests[activeSlice] : null}
          onClose={() => setActiveSlice(null)}
        />
      </div>

      <style>{`
        @keyframes cakeCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}