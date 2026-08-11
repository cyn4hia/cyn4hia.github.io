import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import Bubbles from "../components/Bubbles";
import images from "../assets/images";

/* ── edit your profile info here ─────────────────────────────── */
const PROFILE = {
  name: "Cindy Zhou",
  email: "zhou.cy@northeastern.edu",
  location: "Boston, Massachusetts",
  linkedin: {
    url: "https://linkedin.com/in/cindy-zhou4",
    handle: "linkedin.com/in/cindy-zhou4",
    headline: "CS & Economics @ Northeastern University",
  },
  github: {
    url: "https://github.com/cyn4hia",
    handle: "cyn4hia",
    bio: "I code",
  },
  discord: {
    username: "perceiving",
    url: "https://discord.com/users/804359414982901800",
    about: "Green grapes are my niche interest 🍵",
    status: " ",
  },
};

/* avatar with grape-gradient "CZ" placeholder until its image exists */
function Avatar({ src, size, ring = "#fff", ringWidth = 3 }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${ringWidth}px solid ${ring}`,
        overflow: "hidden",
        background: "radial-gradient(circle at 35% 30%, #c8e39b, #8db860 60%, #6a9a3a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxSizing: "content-box",
      }}
    >
      {!failed ? (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: size * 0.34,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: 1,
          }}
        >
          CZ
        </span>
      )}
    </div>
  );
}

/* banner with per-platform gradient placeholder until its image exists */
function Banner({ src, height, fallback }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ height, background: fallback, overflow: "hidden" }}>
      {!failed && (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
    </div>
  );
}

/* small platform badge shown on the card corner */
function Badge({ children, bg }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        width: 26,
        height: 26,
        borderRadius: 6,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
}

/* shared card shell: pop-in entrance + bubbly hover lift */
function CardShell({ delay, href, onClick, children, footer, footerColor }) {
  const [hovered, setHovered] = useState(false);
  const Tag = href ? "a" : "div";
  return (
    <Tag
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 290,
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        textDecoration: "none",
        display: "block",
        animation: `cardPop 0.75s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms backwards`,
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease",
        boxShadow: hovered
          ? "0 22px 48px rgba(90,110,50,0.22)"
          : "0 8px 28px rgba(90,110,50,0.10)",
      }}
    >
      {children}
      <div
        style={{
          padding: "8px 14px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10.5,
          letterSpacing: 0.4,
          color: footerColor,
          borderTop: "1px solid rgba(128,128,128,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{footer}</span>
        <span style={{ opacity: hovered ? 1 : 0.45, transition: "opacity 0.25s" }}>↗</span>
      </div>
    </Tag>
  );
}

/* ── LinkedIn profile preview ────────────────────────────────── */
function LinkedInCard({ delay }) {
  return (
    <CardShell delay={delay} href={PROFILE.linkedin.url} footer={PROFILE.linkedin.handle} footerColor="#8a8a8a">
      <div style={{ background: "#fff" }}>
        <div style={{ position: "relative" }}>
          <Banner
            src={images.bannerLinkedin}
            height={68}
            fallback="linear-gradient(105deg, #a8c8e8, #d0e2f2 55%, #e8f0d8)"
          />
          <Badge bg="#0a66c2">
            <span style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13 }}>in</span>
          </Badge>
          <div style={{ position: "absolute", left: 16, bottom: -34 }}>
            <Avatar src={images.avatarLinkedin} size={68} ring="#fff" ringWidth={3} />
          </div>
        </div>
        <div style={{ padding: "42px 16px 16px", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#191919" }}>{PROFILE.name}</div>
          <div style={{ fontSize: 12.5, color: "#333", marginTop: 3, lineHeight: 1.45 }}>
            {PROFILE.linkedin.headline}
          </div>
          <div style={{ fontSize: 11.5, color: "#767676", marginTop: 5 }}>{PROFILE.location}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <span
              style={{
                background: "#0a66c2",
                color: "#fff",
                borderRadius: 999,
                padding: "5px 16px",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              Connect
            </span>
            <span
              style={{
                border: "1px solid #0a66c2",
                color: "#0a66c2",
                borderRadius: 999,
                padding: "4px 16px",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              Message
            </span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

/* ── GitHub profile preview (live stats when the API allows) ──── */
function GitHubCard({ delay }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/users/${PROFILE.github.handle}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setStats({ followers: d.followers, repos: d.public_repos }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const levels = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
  const cell = (r, c) => {
    const n = Math.abs(Math.sin(r * 78.233 + c * 12.9898) * 43758.5453) % 1;
    return n < 0.44 ? 0 : n < 0.62 ? 1 : n < 0.78 ? 2 : n < 0.92 ? 3 : 4;
  };

  return (
    <CardShell delay={delay} href={PROFILE.github.url} footer={`github.com/${PROFILE.github.handle}`} footerColor="#8b949e">
      <div style={{ background: "#0d1117", padding: "16px 16px 14px", position: "relative", fontFamily: "'DM Sans', sans-serif" }}>
        <Badge bg="#f0f6fc">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d1117">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </Badge>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar src={images.avatarGithub} size={62} ring="#30363d" ringWidth={1.5} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f6fc" }}>{PROFILE.name}</div>
            <div style={{ fontSize: 13, color: "#8b949e" }}>@{PROFILE.github.handle}</div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: "#c9d1d9", marginTop: 10 }}>{PROFILE.github.bio}</div>
        <div style={{ fontSize: 11.5, color: "#8b949e", marginTop: 6, display: "flex", gap: 12 }}>
          <span>📍 Boston</span>
          {stats && (
            <>
              <span>
                <b style={{ color: "#f0f6fc" }}>{stats.followers}</b> followers
              </span>
              <span>
                <b style={{ color: "#f0f6fc" }}>{stats.repos}</b> repos
              </span>
            </>
          )}
        </div>
        {/* mini contribution graph */}
        <div style={{ display: "flex", gap: 2.5, marginTop: 12 }}>
          {Array.from({ length: 26 }, (_, c) => (
            <div key={c} style={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {Array.from({ length: 7 }, (_, r) => (
                <div key={r} style={{ width: 7, height: 7, borderRadius: 2, background: levels[cell(r, c)] }} />
              ))}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            background: "#21262d",
            border: "1px solid #30363d",
            borderRadius: 6,
            padding: "5px 0",
            color: "#f0f6fc",
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          Follow
        </div>
      </div>
    </CardShell>
  );
}

/* ── Discord profile preview ─────────────────────────────────── */
function DiscordCard({ delay }) {
  return (
    <CardShell delay={delay} href={PROFILE.discord.url} footer={`discord · @${PROFILE.discord.username}`} footerColor="#949ba4">
      <div style={{ background: "#111214", position: "relative", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ position: "relative" }}>
          <Banner
            src={images.bannerDiscord}
            height={60}
            fallback="linear-gradient(105deg, #5865F2, #7983f5 60%, #8db860)"
          />
          <Badge bg="#5865F2">
            <svg width="16" height="12" viewBox="0 0 127.14 96.36" fill="#fff">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
          </Badge>
          <div style={{ position: "absolute", left: 14, bottom: -30 }}>
            <div style={{ position: "relative" }}>
              <Avatar src={images.avatarDiscord} size={60} ring="#111214" ringWidth={4} />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#23a55a",
                  border: "3.5px solid #111214",
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ padding: "38px 14px 14px" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#f2f3f5" }}>{PROFILE.name.split(" ")[0].toLowerCase()}</div>
          <div style={{ fontSize: 12.5, color: "#b5bac1" }}>{PROFILE.discord.username}</div>
          <div
            style={{
              background: "#1e1f22",
              borderRadius: 8,
              padding: "10px 12px",
              marginTop: 12,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: "#b5bac1", textTransform: "uppercase" }}>
              About Me
            </div>
            <div style={{ fontSize: 12.5, color: "#dbdee1", marginTop: 5, lineHeight: 1.5 }}>
              {PROFILE.discord.about}
            </div>
            <div style={{ fontSize: 12, color: "#b5bac1", marginTop: 8 }}>{PROFILE.discord.status}</div>
          </div>
          <div
            style={{
              marginTop: 12,
              textAlign: "center",
              background: "#5865F2",
              borderRadius: 6,
              padding: "6px 0",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            Add Friend
          </div>
        </div>
      </div>
    </CardShell>
  );
}

/* ── the original grape, popping in beside the heading ───────── */
function HeroGrape() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 110, height: 110 }}>
      {/* pop ring burst */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 100,
          height: 100,
          marginLeft: -50,
          marginTop: -50,
          borderRadius: "50%",
          border: "2px solid rgba(141,184,96,0.55)",
          animation: "popRing 0.65s ease-out 620ms",
          opacity: 0,
        }}
      />
      <div style={{ animation: "grapePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 500ms backwards" }}>
        <img
          src={images.cold}
          alt="Green grape"
          style={{
            width: 110,
            height: 110,
            objectFit: "contain",
            display: "block",
            animation: "grapeIdle 4s ease-in-out 1300ms infinite",
          }}
        />
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────── */
export default function ContactPage({ onBack }) {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard?.writeText(PROFILE.email).catch(() => {});
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1000px circle at 50% 0%, #f6f9ef, #ffffff 65%)",
        padding: "70px 32px 60px",
        position: "relative",
      }}
    >
      <Bubbles />
      <BackButton onClick={onBack} />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        {/* header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "#6a9a3a",
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 700,
              animation: "riseIn 0.6s cubic-bezier(0.22,1,0.36,1) 150ms both",
            }}
          >
            Get In Touch
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              marginTop: 10,
            }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(34px, 5vw, 52px)",
                color: "#5a5a5a",
                fontWeight: 300,
                margin: 0,
                animation: "riseIn 0.7s cubic-bezier(0.22,1,0.36,1) 280ms both",
              }}
            >
              Where you can find me.
            </h1>
            <HeroGrape />
          </div>

          {/* email chip */}
          <button
            onClick={copyEmail}
            style={{
              marginTop: 18,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: emailCopied ? "rgba(141,184,96,0.18)" : "rgba(255,255,255,0.9)",
              border: "1px solid rgba(141,184,96,0.35)",
              borderRadius: 999,
              padding: "9px 22px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#5a8a2a",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(90,110,50,0.10)",
              transition: "background 0.25s ease",
              animation: "grapePop 0.6s cubic-bezier(0.34,1.56,0.64,1) 420ms both",
            }}
          >
            ✉ {emailCopied ? "email copied! ✓" : PROFILE.email}
          </button>
        </div>

        {/* profile preview cards */}
        <div
          style={{
            display: "flex",
            gap: 26,
            justifyContent: "center",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <LinkedInCard delay={550} />
          <GitHubCard delay={700} />
          <DiscordCard delay={850} />
        </div>

        <p
          style={{
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12.5,
            color: "#bbb",
            fontStyle: "italic",
            marginTop: 44,
            animation: "riseIn 0.7s ease 1200ms both",
          }}
        >
          I'm always just one green grape away. Haha
        </p>
      </div>

    </div>
  );
}
