import { useState, useCallback, useEffect } from "react";
import HomePage from "./pages/HomePage";
import { imagesReady } from "./assets/preload";
import { loadCafeScene } from "./cafe/loadScene";

/* start fetching the 3D café right away, while the splash is up */
loadCafeScene();

/* matcha-dot splash shown while images decode and the café warms up */
function Splash({ done }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#f1e7d8",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        opacity: done ? 0 : 1,
        pointerEvents: done ? "none" : "auto",
        transition: "opacity 0.7s ease",
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
              background: "radial-gradient(circle at 35% 30%, #c3d99a, #7fa24a 60%, #587a2e)",
              animation: `splash-bob 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 24,
          color: "#8a7a66",
        }}
      >
        brewing…
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
 * Root app component. The whole site is the home café now (every section
 * lives on a note on the table). The café is mounted behind the splash so
 * its 3D scene can compile; the splash lifts once images are decoded and
 * the first frames are drawn (max 8s).
 */
export default function App() {
  const [imagesDone, setImagesDone] = useState(false);
  const [sceneDone, setSceneDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const onSceneReady = useCallback(() => setSceneDone(true), []);

  useEffect(() => {
    let alive = true;
    const imageCap = new Promise((res) => setTimeout(res, 4000));
    Promise.race([imagesReady, imageCap]).then(() => {
      if (alive) setImagesDone(true);
    });
    const t = setTimeout(() => alive && setTimedOut(true), 8000);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  const ready = (imagesDone && sceneDone) || timedOut;

  return (
    <>
      <Splash done={ready} />
      <HomePage play={ready} onReady={onSceneReady} />
    </>
  );
}
