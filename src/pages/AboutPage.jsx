import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import PageHeader from "../components/PageHeader";
import images from "../assets/images";

/**
 * "Crunchy" — About Me page.
 * Edit the bio text and info cards below with your own details.
 */

const infoCards = [
  { label: "Education", value: "Your university & major" },
  { label: "Location", value: "Your city" },
  { label: "Currently", value: "What you're working on" },
  { label: "Contact", value: "your@email.com" },
];

export default function AboutPage({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: "80px 40px 60px" }}>
      <BackButton onClick={onBack} />

      <div style={{ maxWidth: 750, margin: "0 auto" }}>
        <FadeIn delay={200}>
          <PageHeader
            title="Crunchy"
            subtitle="About Me"
            imgSrc={images.crunchy}
            imgW={55}
            imgH={40}
          />
        </FadeIn>

        {/* Bio card */}
        <FadeIn delay={400}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "50px 48px",
              border: "1px solid rgba(141,184,96,0.12)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                color: "var(--text-dark)",
                fontWeight: 400,
                margin: "0 0 20px",
              }}
            >
              Hello! I'm Cindy.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 16,
                color: "var(--text-main)",
                lineHeight: 1.9,
                margin: "0 0 18px",
              }}
            >
              Write about yourself here — your background, what you're studying,
              what drives you.
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 16,
                color: "var(--text-main)",
                lineHeight: 1.9,
                margin: 0,
              }}
            >
              Share your journey, passions, and what makes you unique.
            </p>
            <div
              style={{
                width: 60,
                height: 2,
                background: "linear-gradient(90deg, var(--grape), transparent)",
                margin: "30px 0",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-light)",
                fontStyle: "italic",
              }}
            >
              "Add a favorite quote or personal motto here."
            </p>
          </div>
        </FadeIn>

        {/* Info grid */}
        <FadeIn delay={600}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginTop: 24,
            }}
          >
            {infoCards.map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "22px 26px",
                  border: "1px solid rgba(141,184,96,0.1)",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    color: "var(--grape-dark)",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    margin: "0 0 6px",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    color: "var(--text-dark)",
                    margin: 0,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
