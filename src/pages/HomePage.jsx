import { useState, useEffect } from "react";
import NavButton from "../components/NavButton";
import images from "../assets/images";
import ContactButton from "../components/ContactButton";

export default function HomePage({ onNavigate }) {
  const [heroVis, setHeroVis] = useState(false);
  const [titleVis, setTitleVis] = useState(false);
  const [subVis, setSubVis] = useState(false);
  const [scale, setScale] = useState(Math.min(1, window.innerWidth / 820));

  useEffect(() => {
    setTimeout(() => setHeroVis(true), 200);
    setTimeout(() => setTitleVis(true), 500);
    setTimeout(() => setSubVis(true), 900);
  }, []);

  useEffect(() => {
    const handleResize = () => setScale(Math.min(1, window.innerWidth / 820));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
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
      {/* ── title ── */}
      <div
        style={{
          position: "relative",
          width: 820,
          height: 600,
          opacity: heroVis ? 1 : 0,
          transform: heroVis ? "scale(1)" : "scale(0.92)",
          transition: "all 1.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* left of stem */}
        <span
          style={{
            position: "absolute",
            bottom: "77%",
            left: "37%",
            fontFamily: "var(--font-display)",
            fontSize: 80,
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
            bottom: "77%",
            right: "28%",
            fontFamily: "var(--font-display)",
            fontSize: 80,
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
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 620,
            height: "auto",
            zIndex: 1,
            animation: "gentle-float 6s ease-in-out infinite",
          }}
        />

        {/*the grape leaf which is ' */}
        <img
          src={images.leaf}
          alt="Grape leaf"
          style={{
            position: "absolute",
            bottom: "79%",
            left: "66%",
            transform: "translateX(-50%)",
            width: 90,
            height: "auto",
            zIndex: 1,
            animation: "gentle-float 6s ease-in-out infinite",
          }}
        />

        {/* "green grapes." + "personal web" — lower-right overlap */}
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            right: "25%",
            zIndex: 2,
            textAlign: "left",
            opacity: subVis ? 1 : 0,
            transform: subVis ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 48,
              fontWeight: 300,
              color: "var(--text-main)",
            }}
          >
            green grapes.
          </h2>
        {/*personal web text */}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "19%",
            right: "45%",
            zIndex: 2,
            textAlign: "left",
            opacity: subVis ? 1 : 0,
            transform: subVis ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--text-light)",
              letterSpacing: 2,
              marginTop: 1,
            }}
          >
            personal web
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "7%",
            right: "60%",
            zIndex: 2,
            textAlign: "left",
            opacity: subVis ? 1 : 0,
            transform: subVis ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--text-light)",
              letterSpacing: 1,
              marginTop: 1,
            }}
          >
            contact me!
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            right: "70%",
            zIndex: 2,
            textAlign: "left",
            opacity: subVis ? 1 : 0,
            transform: subVis ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 21,
              color: "var(--text-light)",
              letterSpacing: 1,
              marginTop: 1,
              transform: "rotateZ(45deg)",
            }}
          >
            ⎯
          </p>
        </div>
      </div>
      <div style={{ position: "relative" }}>
          <ContactButton           
            imgSrc={images.contact}
            imgW={150}
            imgH={150}
            onClick={() => onNavigate("contact")}
            delay={1200}
            imgX={0}
            imgY={20}
          />
      </div>
        {/* nav */}
        <nav
          style={{
            display: "flex",
            gap: 50,
            marginTop: 0,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <NavButton
            label="Sweet"
            subtitle="Projects"
            imgSrc={images.sweet}
            imgW={60}
            imgH={60}
            onClick={() => onNavigate("projects")}
            delay={1200}
          />
          <NavButton
            label="Crunchy"
            subtitle="About Me"
            imgSrc={images.crunchy}
            imgW={75}
            imgH={62}
            onClick={() => onNavigate("about")}
            delay={1400}
          />
          <NavButton
            label="Cold"
            subtitle="Interests"
            imgSrc={images.cold}
            imgW={60}
            imgH={60}
            onClick={() => onNavigate("interests")}
            delay={1600}
          />
        </nav>
      </div>
    </div>
  );
}
