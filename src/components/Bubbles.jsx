/**
 * Ambient grape-tinted bubbles drifting up the page.
 * Purely decorative — never intercepts pointer events.
 * Parent element must be positioned (relative/absolute).
 */
const BUBBLES = [
  { left: "6%", size: 26, dur: 14, delay: 0, drift: 30 },
  { left: "14%", size: 12, dur: 11, delay: -4, drift: -22 },
  { left: "24%", size: 18, dur: 16, delay: -9, drift: 26 },
  { left: "38%", size: 10, dur: 12, delay: -2, drift: -18 },
  { left: "52%", size: 22, dur: 17, delay: -12, drift: 24 },
  { left: "64%", size: 14, dur: 10, delay: -6, drift: -28 },
  { left: "74%", size: 30, dur: 18, delay: -3, drift: 20 },
  { left: "84%", size: 12, dur: 13, delay: -8, drift: -16 },
  { left: "92%", size: 20, dur: 15, delay: -11, drift: 24 },
  { left: "45%", size: 8, dur: 9, delay: -5, drift: 14 },
];

export default function Bubbles({ count = BUBBLES.length }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {BUBBLES.slice(0, count).map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.left,
            bottom: -40,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), rgba(200,227,155,0.35) 55%, rgba(141,184,96,0.18))",
            border: "1px solid rgba(141,184,96,0.25)",
            animation: `bubbleUp ${b.dur}s linear ${b.delay}s infinite`,
            "--drift": `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
