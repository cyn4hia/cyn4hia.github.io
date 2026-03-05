import { useState } from "react";
import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import images from "../assets/images";

const projects = [
  {
    name: "Grapes",
    desc: "Personal portfolio website (you're on it!)",
    price: 3.26,
    tags: ["React", "CSS/HTML"],
    link: null,
  },
  {
    name: "TFT Profile Card",
    desc: "My dynamic TFT history + profile details for my Github README",
    price: 2.26,
    tags: ["Python", "SVG"],
    link: null,
  },
  {
    name: "Cook Your Books",
    desc: "CS 3100 Semester Project",
    price: 1.26,
    tags: ["JSON", "Java"],
    link: null,
  },
  {
    name: "Royale High Halo Predictor",
    desc: "Using LLMs to predict ingame price values for Royale High Roblox game",
    price: 4.25,
    tags: ["React", "Claude API", "JavaScript"],
    link: null,
  },
  {
    name: "TFT Flashcards",
    desc: "Custom flashcard deck that helps you learn TFT trait",
    price: 9.25,
    tags: ["JavaScript", "Python"],
    link: null,
  },
];

const subtotal = projects.reduce((sum, item) => sum + item.price, 0);

const today = new Date();
const dateStr = today.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
const timeStr = today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const DottedLine = () => (
  <div style={{ borderBottom: "2px dashed #c0c0c0", margin: "14px 0", width: "100%" }} />
);

const ReceiptItem = ({ item, delay }) => {
  const [hovered, setHovered] = useState(false);
  const content = (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ padding: "10px 0", cursor: item.link ? "pointer" : "default", transition: "all 0.3s ease", transform: hovered ? "scale(1.01)" : "scale(1)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "'Courier New', monospace", fontSize: 15, fontWeight: 700, color: hovered ? "#6a9a3a" : "#333", transition: "color 0.3s ease" }}>
          <span>{item.name.toUpperCase()}</span>
          <span>${item.price.toFixed(2)}</span>
        </div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#888", marginTop: 3 }}>{item.desc}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {item.tags.map((tag) => (
            <span key={tag} style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "#6a9a3a", border: "1px solid rgba(141,184,96,0.3)", padding: "2px 8px", borderRadius: 2, textTransform: "uppercase" }}>{tag}</span>
          ))}
        </div>
      </div>
    </FadeIn>
  );
  if (item.link) return <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{content}</a>;
  return content;
};

export default function ProjectsPage({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", padding: "80px 20px 60px" }}>
      <BackButton onClick={onBack} />
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <FadeIn delay={100}>
          <svg width="100%" height="12" style={{ display: "block" }}>
            <defs>
              <pattern id="zigTop" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <polygon points="0,12 6,0 12,12" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="12" fill="url(#zigTop)" />
          </svg>
          <div style={{ background: "#fff", padding: "40px 32px 48px" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                <img src={images.sweet} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#333", letterSpacing: 3, textTransform: "uppercase" }}>Project Receipt</span>
              </div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#999", letterSpacing: 1 }}>Design and Development</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#999", marginTop: 2 }}>--------------------------------</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Courier New', monospace", fontSize: 11, color: "#999", margin: "8px 0" }}>
              <span>DATE: {dateStr}</span>
              <span>TIME: {timeStr}</span>
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#999", marginBottom: 4 }}>ORDER #: 0004</div>

            <DottedLine />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>
              <span>ITEM</span><span>DATE</span>
            </div>
            <DottedLine />

            {projects.map((item, i) => (
              <div key={i}>
                <ReceiptItem item={item} delay={300 + i * 120} />
                {i < projects.length - 1 && <div style={{ borderBottom: "1px solid #eee", margin: "2px 0" }} />}
              </div>
            ))}

            <DottedLine />
            <FadeIn delay={300 + projects.length * 120}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 4 }}><span>SUBTOTAL ({projects.length} items)</span><span>${subtotal.toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 4 }}><span>TAX</span><span>my sleep lol</span></div>
                <DottedLine />
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 16, color: "#333", padding: "4px 0" }}><span>TOTAL</span><span>4 green grapes</span></div>
              </div>
            </FadeIn>

            <DottedLine />
            <FadeIn delay={300 + projects.length * 120 + 400}>
              <div style={{ textAlign: "center", marginTop: 12, marginBottom: 40 }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 14, color: "#333", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>THANK YOU FOR SHOPPING!</div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#999" }}>github.com/cyn4hia</div>
              </div>
              <svg
              width="800"
              height="200"
              viewBox="0 0 60 200"
              style={{
                position: "absolute",
                right: -100,
                top: 10,
                pointerEvents: "none",
              }}
            >
              {/* barcode */}
              <rect x="30" y="45" width="2" height="50" rx="0" fill="#000000" />
              <rect x="40" y="45" width="4" height="50" rx="0" fill="#000000" />
              <rect x="50" y="45" width="3" height="50" rx="0" fill="#000000" />
              <rect x="60" y="45" width="6" height="50" rx="0" fill="#000000" />
              <rect x="70" y="45" width="2" height="50" rx="0" fill="#000000" />
              <rect x="80" y="45" width="4" height="50" rx="0" fill="#000000" />
              <rect x="90" y="45" width="7" height="50" rx="0" fill="#000000" />
              <rect x="100" y="45" width="5" height="50" rx="0" fill="#000000" />
              <rect x="110" y="45" width="4" height="50" rx="0" fill="#000000" />
              <rect x="120" y="45" width="3" height="50" rx="0" fill="#000000" />
              <rect x="130" y="45" width="2" height="50" rx="0" fill="#000000" />
              <rect x="140" y="45" width="6" height="50" rx="0" fill="#000000" />
              <rect x="150" y="45" width="2" height="50" rx="0" fill="#000000" />
              <rect x="160" y="45" width="4" height="50" rx="0" fill="#000000" />
              <rect x="170" y="45" width="3" height="50" rx="0" fill="#000000" />
              <rect x="180" y="45" width="2" height="50" rx="0" fill="#000000" />
              <rect x="185" y="45" width="8" height="50" rx="0" fill="#000000" />
              <rect x="200" y="45" width="3" height="50" rx="0" fill="#000000" />
              <rect x="210" y="45" width="2" height="50" rx="0" fill="#000000" />
              <rect x="220" y="45" width="2" height="50" rx="0" fill="#000000" />
              <rect x="230" y="45" width="6" height="50" rx="0" fill="#000000" />
              <rect x="240" y="45" width="4" height="50" rx="0" fill="#000000" />
              <rect x="250" y="45" width="5" height="50" rx="0" fill="#000000" />
              <rect x="260" y="45" width="7" height="50" rx="0" fill="#000000" />
              <rect x="270" y="45" width="3" height="50" rx="0" fill="#000000" />
            </svg>

            </FadeIn>
            </div>
            <svg width="100%" height="12" style={{ display: "block" }}>
            <defs>
              <pattern id="zigBot" x="0" y="0" width="12" height="20" patternUnits="userSpaceOnUse">
                <polygon points="0,0 6,12 12,0" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="12" fill="url(#zigBot)" />
          </svg>
        </FadeIn>
      </div>
    </div>
  );
}