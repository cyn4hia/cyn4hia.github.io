import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import images from "../assets/images";


const iceCubes = [
  {
    label: "Education",
    detail: "Computer Science and Economics @ Northeastern University",
    subtext: "Class of 2029\nDean's List",
    x: -60,
    baseY: -9,
    size: 44,
    floatSpeed: 3.2,
    floatAmp: 5,
    rotation: 12,
    tint: 0.08,
  },
  {
    label: "Social Media",
    detail: "Earned over 1 million views across 3 accounts on TikTok",
    subtext: "Over 1k Followers and 400k views on a gaming account\nOver 1k followers and 400k views on a study motivation account",
    x: 30,
    baseY: -2,
    size: 38,
    floatSpeed: 2.6,
    floatAmp: 5,
    rotation: -16,
    tint: 0.1,
  },
  {
    label: "Video games",
    detail: "I'm bad at every game I play",
    subtext: "Extremely hardstuck diamond in Teamfight Tactics",
    x: -35,
    baseY: 41,
    size: 36,
    floatSpeed: 3.8,
    floatAmp: 6,
    rotation: 7,
    tint: 0.16,
  },
  {
    label: "Fun Fact",
    detail: "I have a matcha addiction",
    subtext: "Specifically obsessed with Marukyu Koyamaen's Isuzu",
    x: 35,
    baseY: 72,
    size: 32,
    floatSpeed: 2.2,
    floatAmp: 5,
    rotation: -10,
    tint: 0.2,
  },
  {
    label: "My favorite place to code",
    detail: "On the treadmill of course!",
    subtext: "Just kidding, I like being cozy while coding (coding in bed is elite)",
    x: -15,
    baseY: 114,
    size: 34,
    floatSpeed: 3.0,
    floatAmp: 5,
    rotation: 18,
    tint: 0.24,
  },
];

/* 3D isometric ice cube with translucent faces + inner refraction */
function IceCube({ cube, index, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);
  const animName = `float-${index}`;
  const lit = hovered || isActive;
  const edge = isActive
    ? "rgba(141,184,96,0.9)"
    : hovered
    ? "rgba(190,215,160,0.9)"
    : "rgba(245,252,240,0.7)";

  return (
    <>
      <style>{`
        @keyframes ${animName} {
          0%, 100% { transform: translate(${cube.x}px, ${cube.baseY}px) rotate(${cube.rotation}deg); }
          50% { transform: translate(${cube.x}px, ${cube.baseY - cube.floatAmp}px) rotate(${cube.rotation + 4}deg); }
        }
      `}</style>
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "absolute",
          left: "48%",
          bottom: "55%",
          width: cube.size,
          height: cube.size,
          cursor: "pointer",
          animation: `${animName} ${cube.floatSpeed}s ease-in-out infinite`,
          zIndex: 5,
          transition: "filter 0.25s ease",
          filter: lit
            ? "drop-shadow(0 0 10px rgba(141,184,96,0.75)) drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
            : "drop-shadow(0 3px 5px rgba(40,70,20,0.16))",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
          <defs>
            <radialGradient id={`iceCore-${index}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(140,190,90,0.4)" />
              <stop offset="100%" stopColor="rgba(140,190,90,0)" />
            </radialGradient>
          </defs>
          {/* inner refracted glow */}
          <ellipse cx="50" cy="55" rx="30" ry="26" fill={`url(#iceCore-${index})`} />
          {/* top face */}
          <polygon
            points="50,2 96,26 50,50 4,26"
            fill={lit ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.65)"}
            stroke={edge}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* left face */}
          <polygon
            points="4,26 50,50 50,98 4,74"
            fill="rgba(230,243,218,0.38)"
            stroke={edge}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* right face */}
          <polygon
            points="50,50 96,26 96,74 50,98"
            fill="rgba(203,228,181,0.3)"
            stroke={edge}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* specular streak on top face */}
          <polygon points="50,10 76,24 62,31 36,17" fill="rgba(255,255,255,0.6)" />
          {/* submerged tint */}
          <rect x="0" y="0" width="100" height="100" fill={`rgba(122,179,56,${cube.tint})`} />
        </svg>
      </div>
    </>
  );
}

/* liquid, glass back wall, submerged straw, bubbles — drawn BEHIND the ice cubes */
function GlassBack() {
  return (
    <svg
      width="400"
      height="400"
      viewBox="0 0 220 300"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="matchaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ab338" stopOpacity="0.92" />
          <stop offset="35%" stopColor="#8dc44a" stopOpacity="0.88" />
          <stop offset="62%" stopColor="#a8d470" stopOpacity="0.78" />
          <stop offset="84%" stopColor="#dcead0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f2efe4" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="glassWall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(210,225,205,0.4)" />
          <stop offset="18%" stopColor="rgba(245,250,242,0.14)" />
          <stop offset="82%" stopColor="rgba(245,250,242,0.1)" />
          <stop offset="100%" stopColor="rgba(210,225,205,0.42)" />
        </linearGradient>
        <radialGradient id="bgBlob" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="rgba(181,204,142,0.16)" />
          <stop offset="100%" stopColor="rgba(181,204,142,0)" />
        </radialGradient>
        <radialGradient id="surfaceGrad" cx="42%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#a4d05e" />
          <stop offset="60%" stopColor="#8bbf45" />
          <stop offset="100%" stopColor="#7ab338" />
        </radialGradient>
        <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* ambient backdrop */}
      <ellipse cx="110" cy="165" rx="120" ry="110" fill="url(#bgBlob)" />

      {/* table shadow */}
      <ellipse cx="112" cy="284" rx="72" ry="11" fill="rgba(70,80,50,0.22)" filter="url(#softBlur)" />

      {/* glass body (back wall) */}
      <path
        d="M46,58 L64,272 Q66,283 78,284 L142,284 Q154,283 156,272 L174,58"
        fill="url(#glassWall)"
        stroke="rgba(190,205,180,0.55)"
        strokeWidth="1.5"
      />
      {/* back rim arc */}
      <path d="M46,58 A64,13 0 0 1 174,58" fill="none" stroke="rgba(200,212,190,0.6)" strokeWidth="1.5" />

      {/* liquid body */}
      <path
        d="M52.5,96 L66,266 Q68,277 80,278 L140,278 Q152,277 154,266 L167.5,96 Q110,82 52.5,96 Z"
        fill="url(#matchaGrad)"
      />

      {/* submerged straw (offset = refraction) */}
      <line x1="139" y1="97" x2="150" y2="252" stroke="rgba(244,242,232,0.55)" strokeWidth="9" strokeLinecap="round" />
      <line x1="136.5" y1="97" x2="147.5" y2="250" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />

      {/* liquid surface */}
      <ellipse cx="110" cy="96" rx="57.5" ry="12" fill="url(#surfaceGrad)" />
      <ellipse cx="98" cy="93.5" rx="26" ry="5" fill="rgba(210,235,160,0.5)" filter="url(#softBlur)" />
      <ellipse cx="130" cy="99" rx="14" ry="3" fill="rgba(90,140,40,0.25)" filter="url(#softBlur)" />
      {/* straw shadow on surface */}
      <ellipse cx="134" cy="98" rx="9" ry="2.5" fill="rgba(70,110,30,0.28)" />

      {/* micro-foam at the surface edge */}
      <circle cx="62" cy="97" r="1.6" fill="rgba(235,245,215,0.8)" />
      <circle cx="68" cy="100" r="1.1" fill="rgba(235,245,215,0.7)" />
      <circle cx="156" cy="99" r="1.4" fill="rgba(235,245,215,0.75)" />

      {/* rising bubbles */}
      {[
        { x: 84, y: 240, r: 2.2, dur: 5.2, delay: 0 },
        { x: 102, y: 252, r: 1.6, dur: 6.1, delay: 1.4 },
        { x: 124, y: 246, r: 2.6, dur: 4.6, delay: 2.6 },
        { x: 93, y: 258, r: 1.3, dur: 6.8, delay: 3.4 },
        { x: 114, y: 250, r: 1.8, dur: 5.6, delay: 4.5 },
      ].map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={b.r}
          fill="rgba(240,250,225,0.65)"
          style={{ animation: `bubbleRise ${b.dur}s ease-in ${b.delay}s infinite` }}
        />
      ))}
    </svg>
  );
}

/* rim, sheen, straw, condensation — drawn IN FRONT of the ice cubes */
function GlassFront() {
  return (
    <svg
      width="400"
      height="400"
      viewBox="0 0 220 300"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 8,
      }}
    >
      <defs>
        <radialGradient id="dropG" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="70%" stopColor="rgba(235,245,225,0.5)" />
          <stop offset="100%" stopColor="rgba(220,235,210,0.15)" />
        </radialGradient>
        <filter id="sheenBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {/* straw above the surface */}
      <line x1="147" y1="10" x2="136.8" y2="96" stroke="#f4f1e6" strokeWidth="9" strokeLinecap="round" />
      <line x1="147" y1="10" x2="136.8" y2="96" stroke="rgba(190,185,160,0.5)" strokeWidth="9" strokeLinecap="round" strokeDasharray="0.1 500" />
      <line x1="144" y1="12" x2="134.4" y2="92" stroke="rgba(255,255,255,0.8)" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="147" cy="9.5" rx="4.6" ry="2" fill="#dcd7c2" transform="rotate(-7 147 9.5)" />

      {/* front rim arc */}
      <path d="M46,58 A64,13 0 0 0 174,58" fill="none" stroke="rgba(215,225,205,0.9)" strokeWidth="2.2" />
      <path d="M46,58 A64,13 0 0 0 174,58" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" transform="translate(0,1.6)" />

      {/* vertical sheens over everything inside */}
      <path d="M60,74 L74,258" stroke="rgba(255,255,255,0.5)" strokeWidth="7" strokeLinecap="round" filter="url(#sheenBlur)" />
      <path d="M158,80 L148,244" stroke="rgba(255,255,255,0.32)" strokeWidth="4" strokeLinecap="round" filter="url(#sheenBlur)" />

      {/* bottom glass thickness */}
      <path d="M66,270 Q68,281 80,282 L140,282 Q152,281 154,270" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />

      {/* condensation droplets */}
      {[
        [58, 150, 2.2], [54, 190, 1.5], [62, 226, 2.6], [76, 250, 1.4],
        [150, 168, 2.0], [158, 205, 1.3], [146, 240, 2.4], [70, 120, 1.3], [154, 132, 1.6],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="url(#dropG)" opacity="0.7" />
      ))}
      {/* one droplet slowly sliding down */}
      <circle cx="66" cy="140" r="2" fill="url(#dropG)" style={{ animation: "dropSlide 7s ease-in 2s infinite" }} />
    </svg>
  );
}

/* info card - clicked one */
function InfoCard({ cube, index, onClose }) {
  if (!cube) return null;
  return (
    <div
      key={cube.label}
      style={{
        background: "linear-gradient(180deg, #fffdf7, #faf6e9)",
        borderRadius: 18,
        padding: "24px 28px 24px 32px",
        border: "1px solid rgba(141,184,96,0.22)",
        boxShadow: "0 12px 36px rgba(90,110,50,0.10)",
        maxWidth: 400,
        margin: "24px auto 0",
        position: "relative",
        overflow: "hidden",
        animation: "infoCardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: "linear-gradient(180deg, #b4cd80, #8db860)",
        }}
      />
      <div style={{ marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: "#6a9a3a",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          {cube.label}
        </span>
      </div>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 23,
          color: "#565656",
          lineHeight: 1.25,
          marginBottom: 10,
        }}
      >
        {cube.detail}
      </p>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "#8a8a8a",
          lineHeight: 1.6,
          margin: 0,
          whiteSpace: "pre-line",
        }}
      >
        {cube.subtext}
      </p>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 10,
          right: 14,
          background: "none",
          border: "none",
          fontSize: 16,
          color: "#b5b5b5",
          cursor: "pointer",
        }}
      >
        ✕
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
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1000px circle at 50% 0%, #f6f9ef, #ffffff 65%)",
        padding: "80px 40px 60px",
      }}
    >
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
              <img src={images.crunchy} alt="" style={{ width: 46, height: 40, objectFit: "contain" }} />
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
              margin: "50px auto 90px",
            }}
          >
            {/* liquid + glass back */}
            <GlassBack />

            {/* floating ice cubes, clipped to the liquid so they stay in the glass */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
                clipPath: "polygon(83px 80px, 237px 80px, 219px 300px, 101px 300px)",
              }}
            >
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

            {/* glass front: rim, sheen, straw, condensation */}
            <GlassFront />
          </div>
        </div>

        {/* info card */}
        <InfoCard
          cube={activeCube !== null ? iceCubes[activeCube] : null}
          index={activeCube ?? 0}
          onClose={() => setActiveCube(null)}
        />
      </div>

      <style>{`
        @keyframes infoCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bubbleRise {
          0% { transform: translateY(0); opacity: 0; }
          12% { opacity: 0.7; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-135px); opacity: 0; }
        }
        @keyframes dropSlide {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(48px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
