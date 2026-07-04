import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import images from "../assets/images";


const interests = [
  {
    label: "Human-AI Interaction",
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

/* ── cake geometry ─────────────────────────────────────────────── */
const CX = 180, CY = 190;   // cake center on the 360x380 stage
const R = 122;              // cake radius
const H = 62;               // cake height
const TILT_X = 55, TILT_Z = -18;
const N = interests.length;
const SLICE = 360 / N;
const GAP = 2.5;            // angular gap between slices
const WALL_SEGS = 6;        // flat panels approximating each slice's curved wall
const LIGHT = 115;          // plane angle the light comes from

const rad = (d) => (d * Math.PI) / 180;
// -1..1 lighting factor for a wall facing plane-angle m
const shade = (m) => Math.cos(rad(m - LIGHT));

const wallColor = (m) => `hsl(43, 48%, ${Math.round(75 + 12 * shade(m))}%)`;
const dripColor = (m) => `hsl(83, 42%, ${Math.round(58 + 9 * shade(m))}%)`;

// layered cross-section shown on the cut faces (top of cake = 0px)
const CUT_LAYERS = `linear-gradient(180deg,
  #a9c26f 0px, #a9c26f 7px,
  #cfe0a4 7px, #cfe0a4 21px,
  #f9f1dd 21px, #f9f1dd 27px,
  #c9dc9c 27px, #c9dc9c 41px,
  #f9f1dd 41px, #f9f1dd 47px,
  #c3d694 47px, #c3d694 62px)`;

/* project a cake-space point (z = height above plate) to overlay/screen coords,
   replicating the stage's translateY(8) rotateX(55) rotateZ(-18) + perspective 1100 */
const PERSP = 1100;
const P_OX = 180, P_OY = 0.22 * 380; // perspective-origin 50% 22%
function project(x, y, z) {
  let vx = x - 180, vy = y - 190, vz = z;
  const cz = Math.cos(rad(TILT_Z)), sz = Math.sin(rad(TILT_Z));
  const x1 = vx * cz - vy * sz;
  const y1 = vx * sz + vy * cz;
  const cx = Math.cos(rad(TILT_X)), sx = Math.sin(rad(TILT_X));
  const y2 = y1 * cx - vz * sx;
  const z2 = y1 * sx + vz * cx;
  const X = x1 + 180, Y = y2 + 190 + 8;
  const w = 1 - z2 / PERSP;
  return [(X - P_OX) / w + P_OX, (Y - P_OY) / w + P_OY];
}

/* screen-space outline of one slice: glazed top + visible outer wall,
   traced as ONE simple loop (apex → top arc → down → bottom arc → up → apex)
   so the polygon never self-intersects */
function slicePolygonPoints(i, pull) {
  const a0 = i * SLICE + GAP / 2;
  const a1 = (i + 1) * SLICE - GAP / 2;
  const mid = (a0 + a1) / 2;
  const ox = Math.cos(rad(mid)) * pull;
  const oy = Math.sin(rad(mid)) * pull;
  const top = (a) => project(CX + ox + (R + 3) * Math.cos(rad(a)), CY + oy + (R + 3) * Math.sin(rad(a)), H);
  const bot = (a) => project(CX + ox + R * Math.cos(rad(a)), CY + oy + R * Math.sin(rad(a)), 0);
  const arc = (from, to, fn, pts) => {
    const n = Math.max(1, Math.ceil(Math.abs(to - from) / 3));
    for (let s = 0; s <= n; s++) pts.push(fn(from + ((to - from) * s) / n));
  };
  // outer wall is only visible where it faces the camera: sin(a + TILT_Z) > 0
  const vs = Math.max(a0, -TILT_Z);
  const ve = Math.min(a1, 180 - TILT_Z);
  const pts = [project(CX + ox, CY + oy, H)];
  if (vs < ve) {
    arc(a0, vs, top, pts); // top rim up to where the wall becomes visible
    arc(vs, ve, bot, pts); // along the wall's bottom edge
    arc(ve, a1, top, pts); // back onto the top rim
  } else {
    arc(a0, a1, top, pts); // back slice: wedge only
  }
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

function wedgePath(cx, cy, r, a0, a1) {
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
}

// wavy glaze edge with one drip lobe, hanging from the top of a wall panel
function dripPath(w, depth) {
  const d = depth;
  return [
    `M0,0 L${w},0 L${w},4`,
    `C${w * 0.92},6 ${w * 0.74},5 ${w * 0.68},9`,
    `C${w * 0.62},${d * 0.75} ${w * 0.8},${d} ${w * 0.55},${d}`,
    `C${w * 0.34},${d} ${w * 0.44},8 ${w * 0.3},6.5`,
    `C${w * 0.16},5 ${w * 0.06},6 0,4 Z`,
  ].join(" ");
}

/* one flat panel of a slice's curved outer wall, standing in 3D */
function WallPanel({ midAngle, chord, dripDepth }) {
  const dist = R * Math.cos(rad(chord.halfStep));
  // slight overlap so anti-aliased seams between panels don't show through
  const w = chord.len + 0.8;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: H,
        pointerEvents: "none",
        transformOrigin: "0 0",
        transform: `translate3d(${CX}px, ${CY}px, 0) rotateZ(${midAngle}deg) translateX(${dist}px) rotateZ(90deg) translateZ(${H}px) rotateX(-90deg) translateX(${-chord.len / 2}px)`,
        background: `linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(88,74,40,0.10) 82%, rgba(88,74,40,0.18) 100%), ${wallColor(midAngle)}`,
      }}
    >
      <svg
        width={w}
        height={26}
        viewBox={`0 0 ${w} 26`}
        style={{ position: "absolute", top: 0, left: 0, display: "block", pointerEvents: "none" }}
      >
        <path d={dripPath(w, dripDepth)} fill={dripColor(midAngle)} />
      </svg>
    </div>
  );
}

/* the flat interior face revealed when a slice pulls out */
function CutFace({ angle, dark }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: R,
        height: H,
        pointerEvents: "none",
        transformOrigin: "0 0",
        transform: `translate3d(${CX}px, ${CY}px, 0) rotateZ(${angle}deg) translateZ(${H}px) rotateX(-90deg)`,
        background: `${dark
          ? "linear-gradient(rgba(70,58,22,0.14), rgba(70,58,22,0.14))"
          : "linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10))"}, ${CUT_LAYERS}`,
      }}
    />
  );
}

/* a full slice: glazed top, dripping wall panels, layered cut faces */
function CakeSlice({ index, isActive, isHovered }) {
  const a0 = index * SLICE + GAP / 2;
  const a1 = (index + 1) * SLICE - GAP / 2;
  const mid = (a0 + a1) / 2;

  const pull = isActive ? 55 : isHovered ? 7 : 0;
  const lift = isActive ? 0 : isHovered ? 9 : 0;
  const px = Math.cos(rad(mid)) * pull;
  const py = Math.sin(rad(mid)) * pull;

  const step = (a1 - a0) / WALL_SEGS;
  const chord = { len: 2 * R * Math.sin(rad(step / 2)), halfStep: step / 2 };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        transformStyle: "preserve-3d",
        transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
        transform: `translate3d(${px}px, ${py}px, ${lift}px)`,
      }}
    >
      {/* cut faces (interior layers) */}
      <CutFace angle={a0} dark />
      <CutFace angle={a1} dark={false} />

      {/* curved outer wall */}
      {Array.from({ length: WALL_SEGS }, (_, j) => {
        const m = a0 + step * (j + 0.5);
        const depth = 10 + ((index * 7 + j * 5) % 3) * 5;
        return <WallPanel key={j} midAngle={m} chord={chord} dripDepth={depth} />;
      })}

      {/* glazed top */}
      <svg
        width="360"
        height="380"
        viewBox="0 0 360 380"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "visible",
          pointerEvents: "none",
          transform: `translateZ(${H}px)`,
        }}
      >
        <defs>
          <radialGradient id={`glaze-${index}`} cx="0.4" cy="0.38" r="0.75">
            <stop offset="0%" stopColor="#d2e4a6" />
            <stop offset="55%" stopColor="#b4cd80" />
            <stop offset="100%" stopColor="#97b365" />
          </radialGradient>
        </defs>
        <path
          d={wedgePath(CX, CY, R + 3, a0, a1)}
          fill={`url(#glaze-${index})`}
          stroke={isHovered || isActive ? "rgba(101,128,52,0.7)" : "rgba(120,142,72,0.35)"}
          strokeWidth={isHovered || isActive ? 1.6 : 0.8}
          style={{ pointerEvents: "none", transition: "stroke 0.2s ease" }}
        />
      </svg>
    </div>
  );
}

/* porcelain plate + contact shadow, lying flat in the 3D scene */
function Plate() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CX - 165,
          top: CY - 152,
          width: 330,
          height: 330,
          borderRadius: "50%",
          transform: "translateZ(-5px)",
          background:
            "radial-gradient(closest-side, rgba(58,58,46,0.30), rgba(58,58,46,0.12) 55%, transparent 78%)",
          filter: "blur(5px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CX - 175,
          top: CY - 175,
          width: 350,
          height: 350,
          borderRadius: "50%",
          transform: "translateZ(-2px)",
          background:
            "radial-gradient(circle at 42% 36%, #ffffff, #f1f0ea 48%, #dedcd4 76%, #c9c7be 92%, #bdbbb2)",
          boxShadow: "inset 0 0 24px rgba(120,118,105,0.18)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CX - 138,
          top: CY - 138,
          width: 276,
          height: 276,
          borderRadius: "50%",
          transform: "translateZ(-1px)",
          border: "1.5px solid rgba(150,148,136,0.35)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function Cutlery() {
  return (
    <>
      {/* fork */}
      <svg
        width="60"
        height="200"
        viewBox="0 0 60 200"
        style={{
          position: "absolute",
          left: -74,
          rotate: "-20deg",
          bottom: 20,
          opacity: 0.8,
          pointerEvents: "none",
          filter: "drop-shadow(3px 6px 5px rgba(0,0,0,0.15))",
        }}
      >
        <defs>
          <linearGradient id="silverF" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e3e4e8" />
            <stop offset="45%" stopColor="#b6b7bd" />
            <stop offset="70%" stopColor="#d5d6da" />
            <stop offset="100%" stopColor="#9fa0a6" />
          </linearGradient>
        </defs>
        <rect x="27" y="80" width="6" height="110" rx="3" fill="url(#silverF)" />
        <rect x="25" y="70" width="10" height="20" rx="3" fill="url(#silverF)" />
        <rect x="12" y="10" width="5" height="65" rx="2.5" fill="url(#silverF)" />
        <rect x="22" y="6" width="5" height="68" rx="2.5" fill="url(#silverF)" />
        <rect x="33" y="6" width="5" height="68" rx="2.5" fill="url(#silverF)" />
        <rect x="43" y="10" width="5" height="65" rx="2.5" fill="url(#silverF)" />
        <rect x="12" y="50" width="36" height="35" rx="10" fill="url(#silverF)" />
        <rect x="29" y="90" width="2" height="80" rx="1" fill="rgba(255,255,255,0.55)" />
      </svg>

      {/* spoon */}
      <svg
        width="60"
        height="200"
        viewBox="0 0 60 200"
        style={{
          position: "absolute",
          right: -74,
          rotate: "20deg",
          bottom: 10,
          opacity: 0.8,
          pointerEvents: "none",
          filter: "drop-shadow(-3px 6px 5px rgba(0,0,0,0.15))",
        }}
      >
        <defs>
          <linearGradient id="silverS" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e3e4e8" />
            <stop offset="45%" stopColor="#b6b7bd" />
            <stop offset="70%" stopColor="#d5d6da" />
            <stop offset="100%" stopColor="#9fa0a6" />
          </linearGradient>
          <radialGradient id="bowlS" cx="40%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#eceded" />
            <stop offset="55%" stopColor="#c8c9cd" />
            <stop offset="100%" stopColor="#a7a8ae" />
          </radialGradient>
        </defs>
        <rect x="27" y="65" width="8" height="115" rx="3.5" fill="url(#silverS)" />
        <ellipse cx="30" cy="38" rx="22" ry="34" fill="url(#bowlS)" />
        <ellipse cx="27" cy="30" rx="12" ry="19" fill="rgba(255,255,255,0.45)" />
        <rect x="29" y="85" width="2" height="85" rx="1" fill="rgba(255,255,255,0.55)" />
      </svg>
    </>
  );
}

/* the assembled 3D cake scene */
function Cake3D({ activeSlice, setActiveSlice }) {
  const [hoverSlice, setHoverSlice] = useState(null);

  return (
    <div style={{ width: 360, height: 380, margin: "0 auto", position: "relative" }}>
      {/* hovered-slice label chip */}
      <div
        style={{
          position: "absolute",
          top: -2,
          left: "50%",
          transform: `translateX(-50%) translateY(${hoverSlice !== null ? 0 : 6}px)`,
          opacity: hoverSlice !== null ? 1 : 0,
          transition: "opacity 0.25s ease, transform 0.25s ease",
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(141,184,96,0.35)",
          borderRadius: 999,
          padding: "6px 16px",
          boxShadow: "0 4px 14px rgba(90,110,50,0.14)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          letterSpacing: 0.5,
          color: "#6a9a3a",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 30,
        }}
      >
        {hoverSlice !== null ? interests[hoverSlice].label : " "}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 1100,
          perspectiveOrigin: "50% 22%",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            transformStyle: "preserve-3d",
            transform: `translateY(8px) rotateX(${TILT_X}deg) rotateZ(${TILT_Z}deg)`,
          }}
        >
          <Plate />
          {interests.map((_, i) => (
            <CakeSlice
              key={i}
              index={i}
              isActive={activeSlice === i}
              isHovered={hoverSlice === i}
            />
          ))}
        </div>
      </div>

      {/* screen-space hit map: exact projection of each slice's visible surface */}
      <svg
        width="360"
        height="380"
        viewBox="0 0 360 380"
        style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none", overflow: "visible" }}
      >
        {interests.map((_, i) => (
          <polygon
            key={i}
            points={slicePolygonPoints(i, activeSlice === i ? 55 : 0)}
            fill="transparent"
            stroke="transparent"
            strokeWidth="5"
            strokeLinejoin="round"
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            onMouseEnter={() => setHoverSlice(i)}
            onMouseLeave={() => setHoverSlice(null)}
            onClick={() => setActiveSlice(activeSlice === i ? null : i)}
          />
        ))}
      </svg>

      <Cutlery />
    </div>
  );
}

/* detail card which appears on click */
function DetailCard({ interest, index, onClose }) {
  if (!interest) return null;
  return (
    <div
      key={interest.label}
      style={{
        background: "linear-gradient(180deg, #fffdf7, #fbf8ee)",
        borderRadius: 18,
        padding: "26px 30px 26px 34px",
        border: "1px solid rgba(141,184,96,0.22)",
        boxShadow: "0 12px 36px rgba(90,110,50,0.10)",
        maxWidth: 420,
        margin: "30px auto 0",
        position: "relative",
        overflow: "hidden",
        animation: "cakeCardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
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
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#a9c478",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 27,
            fontWeight: 500,
            color: "#565656",
          }}
        >
          {interest.label}
        </span>
      </div>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: "#828282",
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        {interest.detail}
      </p>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          background: "none",
          border: "none",
          fontSize: 18,
          color: "#b5b5b5",
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
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1000px circle at 50% 0%, #f6f9ef, #ffffff 65%)",
        padding: "80px 40px 60px",
      }}
    >
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
          index={activeSlice ?? 0}
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
