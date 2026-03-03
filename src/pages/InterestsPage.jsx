import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import PageHeader from "../components/PageHeader";
import InterestCard from "../components/InterestCard";
import images from "../assets/images";

/**
 * "Cold" — Interests page.
 * Edit the `interests` array below with your own hobbies and interests.
 */

const interests = [
  { emoji: "\uD83D\uDCBB", title: "Web Development", desc: "Building interactive experiences" },
  { emoji: "\uD83C\uDFAE", title: "Gaming", desc: "Favorite games or genres" },
  { emoji: "\uD83D\uDCDA", title: "Reading", desc: "Books and topics you love" },
  { emoji: "\uD83C\uDFB5", title: "Music", desc: "Artists and instruments" },
  { emoji: "\uD83C\uDF31", title: "Gardening", desc: "Or any hobby you enjoy" },
  { emoji: "\u2708\uFE0F", title: "Travel", desc: "Places to explore" },
];

export default function InterestsPage({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: "80px 40px 60px" }}>
      <BackButton onClick={onBack} />

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeIn delay={200}>
          <PageHeader
            title="Cold"
            subtitle="Interests"
            imgSrc={images.cold}
            imgW={40}
            imgH={40}
          />
        </FadeIn>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {interests.map((item, i) => (
            <FadeIn key={i} delay={350 + i * 100}>
              <InterestCard {...item} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
