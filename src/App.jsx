import { useState, useCallback, useEffect } from "react";
import PageTransition from "./components/PageTransition";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import AboutPage from "./pages/AboutPage";
import InterestsPage from "./pages/InterestsPage";
import ContactPage from "./pages/ContactPage";
import { imagesReady } from "./assets/preload";

/* tiny grape-pulse splash shown while all images finish decoding */
function Splash({ done }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        opacity: done ? 0 : 1,
        pointerEvents: done ? "none" : "auto",
        transition: "opacity 0.5s ease",
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #c8e39b, #8db860 60%, #6a9a3a)",
              animation: `splash-bob 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          letterSpacing: 3,
          color: "#b5cc8e",
          textTransform: "lowercase",
        }}
      >
        ripening…
      </span>
      <style>{`
        @keyframes splash-bob {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/**
 * Root app component.
 * Manages which page is active and renders transitions.
 * Holds a splash until every image is fetched + decoded (max 4s),
 * so no page ever paints with half-loaded art.
 */
export default function App() {
  const [page, setPage] = useState("home");
  const [ready, setReady] = useState(false);
  const navigate = useCallback((p) => setPage(p), []);
  const goHome = useCallback(() => setPage("home"), []);

  useEffect(() => {
    let alive = true;
    const timeout = new Promise((res) => setTimeout(res, 4000));
    Promise.race([imagesReady, timeout]).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Splash done={ready} />
      {ready && (
        <>
          <HomePage onNavigate={navigate} />

          <PageTransition isVisible={page === "projects"}>
            <ProjectsPage onBack={goHome} />
          </PageTransition>

          <PageTransition isVisible={page === "about"}>
            <AboutPage onBack={goHome} />
          </PageTransition>

          <PageTransition isVisible={page === "interests"}>
            <InterestsPage onBack={goHome} />
          </PageTransition>

          <PageTransition isVisible={page === "contact"}>
            <ContactPage onBack={goHome} />
          </PageTransition>
        </>
      )}
    </>
  );
}
