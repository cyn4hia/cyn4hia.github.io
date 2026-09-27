import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import Bubbles from "../components/Bubbles";
import images from "../assets/images";

/* which grocery item each interest rides in on — index-matched to the
   fruit roster inside FruitCart3D */
const FRUIT_TAGS = [
  { emoji: "🍇", name: "green grapes" },
  { emoji: "🍊", name: "orange" },
  { emoji: "🫐", name: "blueberries" },
  { emoji: "🍒", name: "cherries" },
  { emoji: "🍎", name: "apple" },
  { emoji: "🍓", name: "strawberry" },
  { emoji: "🍋", name: "lemon" },
  { emoji: "🥝", name: "kiwi" },
];

/* each interest is one item in the grocery haul — index-matched to FRUITS */
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

/* detail card which appears when a fruit is picked from the cart */
function DetailCard({ interest, fruit, index, onClose }) {
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
        margin: "18px auto 0",
        position: "relative",
        overflow: "hidden",
        animation: "cartCardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
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
      {/* which grocery item this interest rode in on */}
      <span
        style={{
          display: "inline-block",
          marginTop: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          letterSpacing: 1,
          color: "#a9c478",
          background: "rgba(141,184,96,0.10)",
          border: "1px solid rgba(141,184,96,0.22)",
          borderRadius: 999,
          padding: "4px 12px",
        }}
      >
        {fruit.emoji} in the cart as: {fruit.name}
      </span>
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
  const [active, setActive] = useState(null);
  const [visible, setVisible] = useState(false);
  const [seed, setSeed] = useState(0); // bump to re-drop the groceries

  /* the 3D scene (and three.js with it) is code-split; a plain dynamic
     import avoids wrapping the Canvas in Suspense, which stalls its
     internal render loop */
  const [FruitCart3D, setFruitCart3D] = useState(null);
  useEffect(() => {
    let alive = true;
    import("../components/FruitCart3D").then((m) => {
      if (alive) setFruitCart3D(() => m.default);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActive((prev) => (prev === null ? 0 : (prev + 1) % interests.length));
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((prev) =>
          prev === null ? interests.length - 1 : (prev - 1 + interests.length) % interests.length
        );
      }
      if (e.key === "Escape") {
        setActive(null);
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
        padding: "80px 18px 60px",
        position: "relative",
      }}
    >
      <Bubbles count={7} />
      <BackButton onClick={onBack} />

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* header */}
        <FadeIn delay={200}>
          <div style={{ textAlign: "center", marginBottom: 10 }}>
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
              marginBottom: 0,
            }}
          >
            my weekly haul of interests — click a fruit to pull it out, or use ← → arrows
          </p>
        </FadeIn>

        {/* the 3D grocery run */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(36px) scale(0.86)",
            transition: "all 0.85s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {FruitCart3D ? (
            <FruitCart3D interests={interests} active={active} setActive={setActive} seed={seed} />
          ) : (
            <div
              style={{
                height: 440,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                letterSpacing: 2,
                color: "#b5cc8e",
              }}
            >
              wheeling the cart in…
            </div>
          )}
        </div>

        {/* restock */}
        <div style={{ textAlign: "center", marginTop: -6 }}>
          <button
            onClick={() => {
              setActive(null);
              setSeed((s) => s + 1);
            }}
            style={{
              background: "none",
              border: "1px solid rgba(141,184,96,0.3)",
              borderRadius: 999,
              padding: "5px 16px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 1.5,
              color: "#a9c478",
              cursor: "pointer",
            }}
          >
            ↺ restock the cart
          </button>
        </div>

        {/* info card */}
        <DetailCard
          interest={active !== null ? interests[active] : null}
          fruit={FRUIT_TAGS[active ?? 0]}
          index={active ?? 0}
          onClose={() => setActive(null)}
        />
      </div>

      <style>{`
        @keyframes cartCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
