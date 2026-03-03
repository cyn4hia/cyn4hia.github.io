/**
 * Shared header for sub-pages (Projects, About, Interests).
 * Shows the grape-themed title + subtitle.
 */
export default function PageHeader({ title, subtitle, imgSrc, imgW = 40, imgH = 40 }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 50 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 48,
            color: "var(--text-main)",
            fontWeight: 300,
          }}
        >
          {title}
        </span>
        <img
          src={imgSrc}
          alt=""
          style={{ width: imgW, height: imgH, objectFit: "contain" }}
        />
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          color: "var(--text-light)",
          letterSpacing: 3,
          fontStyle: "italic",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
