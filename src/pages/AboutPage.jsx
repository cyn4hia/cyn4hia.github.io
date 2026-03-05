import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import images from "../assets/images";


const iceCubes = [
  {
    label: "Education",
    detail: "Computer Science and Economics @ Northeastern University",
    subtext: "Class of 2029\nDean's List",
    x: -80,
    baseY: 60,
    size: 44,
    floatSpeed: 3.2,
    floatAmp: 12,
    rotation: 15,
  },
  {
    label: "Social Media",
    detail: "I'm famous!",
    x: 50,
    baseY: 45,
    size: 38,
    floatSpeed: 2.6,
    floatAmp: 10,
    rotation: -20,
  },
  {
    label: "Video games",
    detail: "I'm bad at every game I play",
    subtext: "Extremely hardstuck diamond in Teamfight Tactics",
    x: -20,
    baseY: 80,
    size: 36,
    floatSpeed: 3.8,
    floatAmp: 14,
    rotation: 8,
  },
  {
    label: "Fun Fact",
    detail: "I have a matcha addiction",
    subtext: "I can also name all the countries in Africa",
    x: 60,
    baseY: 95,
    size: 32,
    floatSpeed: 2.2,
    floatAmp: 11,
    rotation: -12,
  },
  {
    label: "My favorite place to code",
    detail: "On the treadmill of course!",
    subtext: "Just kidding, I like being cozy while coding",
    x: -65,
    baseY: 110,
    size: 34,
    floatSpeed: 3.0,
    floatAmp: 9,
    rotation: 22,
  },
];

/* ice cubes */
function IceCube({ cube, index, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);
  const animName = `float-${index}`;

  return (
    <>
      <style>{`
        @keyframes ${animName} {
          0%, 100% { transform: translate(${cube.x}px, ${cube.baseY}px) rotate(${cube.rotation}deg); }
          50% { transform: translate(${cube.x}px, ${cube.baseY - cube.floatAmp}px) rotate(${cube.rotation + 3}deg); }
        }
      `}</style>
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "absolute",
          left: "48%",
          bottom: "25%",
          width: cube.size,
          height: cube.size,
          cursor: "pointer",
          animation: `${animName} ${cube.floatSpeed}s ease-in-out infinite`,
          zIndex: 5,
          transition: "filter 0.2s ease",
          filter: hovered || isActive
            ? "drop-shadow(0 0 8px rgba(141,184,96,0.6))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 6,
            background: isActive
              ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(200,230,180,0.7))"
              : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(220,240,220,0.5))",
            border: isActive
              ? "2px solid rgba(141,184,96,0.5)"
              : hovered
              ? "2px solid rgba(141,184,96,0.3)"
              : "1px solid rgba(255,255,255,0.6)",
            backdropFilter: "blur(2px)",
            boxShadow: isActive
              ? "inset 0 0 12px rgba(141,184,96,0.15), 0 4px 16px rgba(0,0,0,0.1)"
              : "inset 0 0 8px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* shine highlight */}
          <div
            style={{
              position: "absolute",
              top: 3,
              left: 3,
              width: "40%",
              height: "30%",
              borderRadius: 4,
              background: "linear-gradient(135deg, rgba(255,255,255,0.8), transparent)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </>
  );
}

/* matcha svg*/
function MatchaGlass() {
  return (
    <svg
      width="400"
      height="400"
      viewBox="0 0 220 300"
      style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}
    >
      {/* cup body */}
      <defs>
        <linearGradient id="matchaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ab338" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#8dc44a" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#a8d470" stopOpacity="0.7" />
          <stop offset="85%" stopColor="#e8eedd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f5f0e8" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="cupGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="70%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
        </linearGradient>
        <clipPath id="cupClip">
          <path d="M15,15 L35,255 Q35,300 65,300 L155,300 Q185,300 185,255 L195,55 Z" />
        </clipPath>
      </defs>

      {/* cup outline */}
      <path
        d="M18,55 L35,255 Q35,300 65,300 L155,300 Q185,300 185,255 L195,55 Z"
        fill="rgba(240,245,235,0.35)"
        stroke="rgba(200,210,190,0.5)"
        strokeWidth="1.5"
      />

      {/* matcha */}
      <rect
        x="0" y="55" width="220" height="260"
        fill="url(#matchaGrad)"
        clipPath="url(#cupClip)"
      />

      {/* glass layer */}
      <path
        d="M18,55 L35,255 Q35,275 65,275 L155,275 Q185,275 185,255 L195,55 Z"
        fill="url(#cupGrad)"
      />


      {/* lid */}
      <ellipse cx="108" cy="52" rx="90" ry="12" fill="#7ab338" stroke="#7ab338" strokeWidth="1" />
      <ellipse cx="108" cy="52" rx="90" ry="12" fill="rgba(230,235,225,0.7)" stroke="rgba(200,210,190,0.5)" strokeWidth="1" />
      {/* lid inner */}
      <ellipse cx="108" cy="52" rx="90" ry="12" fill="rgba(240,245,235,0.5)" />
      <ellipse cx="108" cy="52" rx="93" ry="13" fill="rgba(205, 209, 201, 0.5)" />
      {/* straw */}
      <rect x="130" y="5" width="7" height="240" rx="3" fill="rgba(245,245,240,0.85)" stroke="rgba(210,210,200,0.4)" strokeWidth="0.5" transform="rotate(8, 133, 45)" />
      {/* straw hole */}
      <ellipse cx="134" cy="48" rx="8" ry="2" fill="rgba(120,160,80,0.4)" />

    </svg>
  );
}

/* info card - clicked one */
function InfoCard({ cube, onClose }) {
  if (!cube) return null;
  return (
    <div
      key={cube.label}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "24px 28px",
        border: "1px solid rgba(141,184,96,0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        maxWidth: 380,
        margin: "24px auto 0",
        position: "relative",
        animation: "infoCardIn 0.4s ease forwards",
      }}
    >
      <div style={{ marginBottom: 3 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: "#6a9a3a",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {cube.label}
        </span>
      </div>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          color: "#5a5a5a",
          lineHeight: 1,
          marginBottom: 10,
        }}
      >
        {cube.detail}
      </p>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 14,
          color: "#5a5a5a",
          lineHeight: 1,
          margin: 0,
          whiteSpace: "pre-line",
        }}
      >
        {cube.subtext}
      </p>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10,
          right: 14,
          background: "none",
          border: "none",
          fontSize: 16,
          color: "#aaa",
          cursor: "pointer",
        }}
      >
      </button>
    </div>
  );
}

/* page */
export default function AboutPage({ onBack }) {
  const [activeCube, setActiveCube] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  /* arrow */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveCube((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % iceCubes.length;
        });
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveCube((prev) => {
          if (prev === null) return iceCubes.length - 1;
          return (prev - 1 + iceCubes.length) % iceCubes.length;
        });
      }
      if (e.key === "Escape") setActiveCube(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: "20px 40px 60px" }}>
      <BackButton onClick={onBack} />

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
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
                Crunchy
              </span>
              <img src={images.crunchy} alt="" style={{ width: 55, height: 40, objectFit: "contain" }} />
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
              About Me
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
              marginBottom: 16,
            }}
          >
            click an ice cube to learn more or use ← → arrows
          </p>
        </FadeIn>

        {/* glass scene */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 320,
              height: 300,
              margin: "0 auto",
              marginBottom: 70,
              marginTop: 70,
            }}
          >
            {/* glass */}
            <MatchaGlass />

            {/* floating ice cubes */}
            {iceCubes.map((cube, i) => (
              <IceCube
                key={i}
                cube={cube}
                index={i}
                isActive={activeCube === i}
                onClick={() => setActiveCube(activeCube === i ? null : i)}
              />
            ))}

          </div>
        </div>

        {/* info card */}
        <InfoCard
          cube={activeCube !== null ? iceCubes[activeCube] : null}
          onClose={() => setActiveCube(null)}
        />

      </div>

      <style>{`
        @keyframes infoCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}