import { useState, useEffect } from "react";
import NavButton from "../components/NavButton";
import images from "../assets/images";

/**
 * Landing page — hero section with overlapping grape bunch,
 * stem acting as apostrophe between "Cindy" and "s",
 * and nav buttons at the bottom.
 */
export default function HomePage({ onNavigate }) {
  const [heroVis, setHeroVis] = useState(false);
  const [titleVis, setTitleVis] = useState(false);
  const [subVis, setSubVis] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVis(true), 200);
    setTimeout(() => setTitleVis(true), 500);
    setTimeout(() => setSubVis(true), 900);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: 20,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* ── Hero: overlapping title + bunch + subtitle ── */}
      <div
        style={{
          position: "relative",
          width: "clamp(480px, 65vw, 820px)",
          height: "clamp(380px, 50vw, 600px)",
          opacity: heroVis ? 1 : 0,
          transform: heroVis ? "scale(1)" : "scale(0.92)",
          transition: "all 1.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* "Cindy" — left of stem */}
        <span
          style={{
            position: "absolute",
            top: "3%",
            left: "12%",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(52px, 7vw, 88px)",
            fontWeight: 300,
            color: "var(--text-main)",
            lineHeight: 1,
            zIndex: 2,
            opacity: titleVis ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          Cindy
        </span>

        {/* "s" — right of stem */}
        <span
          style={{
            position: "absolute",
            top: "3%",
            right: "22%",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(52px, 7vw, 88px)",
            fontWeight: 300,
            color: "var(--text-main)",
            lineHeight: 1,
            zIndex: 2,
            opacity: titleVis ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          s
        </span>

        {/* Grape bunch — large, overlapping title & subtitle */}
        <img
          src={images.bunch}
          alt="Green grapes"
          style={{
            position: "absolute",
            top: "8%",
            left: "50%",
            transform: "translateX(-55%)",
            width: "clamp(300px, 42vw, 500px)",
            height: "auto",
            zIndex: 1,
            animation: "gentle-float 6s ease-in-out infinite",
          }}
        />

        {/* "green grapes." + "personal web" — lower-right overlap */}
        <div
          style={{
            position: "absolute",
            bottom: "14%",
            right: "5%",
            zIndex: 2,
            textAlign: "center",
            opacity: subVis ? 1 : 0,
            transform: subVis ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(30px, 4vw, 52px)",
              fontWeight: 300,
              color: "var(--text-main)",
            }}
          >
            green grapes.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(12px, 1.3vw, 16px)",
              color: "var(--text-light)",
              letterSpacing: 2,
              marginTop: 2,
            }}
          >
            personal web
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          display: "flex",
          gap: "clamp(30px, 8vw, 100px)",
          marginTop: 30,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <NavButton
          label="Sweet"
          subtitle="Projects"
          imgSrc={images.sweet}
          imgW={40}
          imgH={40}
          onClick={() => onNavigate("projects")}
          delay={1200}
        />
        <NavButton
          label="Crunchy"
          subtitle="About Me"
          imgSrc={images.crunchy}
          imgW={55}
          imgH={42}
          onClick={() => onNavigate("about")}
          delay={1400}
        />
        <NavButton
          label="Cold"
          subtitle="Interests"
          imgSrc={images.cold}
          imgW={42}
          imgH={42}
          onClick={() => onNavigate("interests")}
          delay={1600}
        />
      </nav>
    </div>
  );
}
