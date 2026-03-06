import { useState } from "react";
import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import images from "../assets/images";

const contactLinks = [
  {
    label: "LinkedIn",
    url: "https://linkedin.com/in/cindy-zhou4",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    url: "https://github.com/cyn4hia",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

function LinkButton({ link }) {
    const [hovered, setHovered] = useState(false);

    return (
        <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 32px",
            borderRadius: 50,
            background: hovered
            ? "rgba(141,184,96,0.12)"
            : "rgba(141,184,96,0.06)",
            border: `1.5px solid ${
            hovered ? "rgba(141,184,96,0.4)" : "rgba(141,184,96,0.18)"
            }`,
            color: hovered ? "#5a8a2a" : "#6a9a3a",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 1,
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            boxShadow: hovered
            ? "0 6px 24px rgba(141,184,96,0.15)"
            : "0 2px 8px rgba(0,0,0,0.03)",
        }}
        >
        {link.icon}
        {link.label}
        </a>
    );
}

export default function ContactPage({ onBack }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#fff",
                padding: "clamp(10px, 1.5vw, 14px) clamp(20px, 3vw, 32px)",
                fontSize: "clamp(12px, 1.5vw, 14px)",
            }}
        >
    
        <BackButton onClick={onBack} />

        <div
            style={{
            display: "flex",
            maxWidth: 900,
            margin: "0 auto",
            alignItems: "center",
            gap: 60,
            minHeight: "calc(100vh - 180px)",
            flexWrap: "wrap",
            justifyContent: "center",
            }}
        >
            {/* image */}
            <FadeIn delay={200} style={{ flex: "0 0 auto" }}>
                <div
                style={{
                    position: "relative",
                    width: "clamp(180px, 30vw, 320px)",
                    height: "clamp(220px, 38vw, 400px)",
                }}
                >
                    {/* image */}
                    <img
                        src={images.cold}
                        alt="Cold grape"
                        style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        zIndex: 1,
                        }}
                    />
                </div>
            </FadeIn>

            {/* content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <FadeIn delay={400}>
                <p
                    style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "clamp(9px, 1.5vw, 11px)",
                        color: "#6a9a3a",
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        fontWeight: 600,
                        margin: "0 0 16px",
                    }}
                >
                    Get In Touch
                </p>
                </FadeIn>

                <FadeIn delay={500}>
                <h1
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(32px, 5vw, 52px)",
                        color: "#5a5a5a",
                        fontWeight: 300,
                        lineHeight: 1.15,
                        margin: "0 0 20px",
                    }}
                >
                    Where you can find me.
                </h1>
                </FadeIn>

                <FadeIn delay={600}>
                <p
                    style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "clamp(13px, 1.8vw, 16px)",
                        color: "#808080",
                        lineHeight: 1.8,
                        margin: "0 0 12px",
                        maxWidth: 420,
                    }}
                >
                    Email: zhou.cy@northeastern.edu
                </p>
                </FadeIn>

                <FadeIn delay={800}>
                <div
                    style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    }}
                >
                    {contactLinks.map((link) => (
                    <LinkButton key={link.label} link={link} />
                    ))}
                </div>
                </FadeIn>

                <FadeIn delay={950}>
                <p
                    style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "clamp(11px, 1.5vw, 13px)",
                        color: "#bbb",
                        fontStyle: "italic",
                        marginTop: 40,
                    }}
                >
                    I'm always just one green grape away. Haha
                </p>
                </FadeIn>
            </div>
        </div>
        {/* mobile */}
        <style>{`
        @media (max-width: 720px) {
            /* handled by flex-wrap or could add responsive overrides */
        }
        `}</style>
    </div>
  );
}