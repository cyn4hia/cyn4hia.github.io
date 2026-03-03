import BackButton from "../components/BackButton";
import FadeIn from "../components/FadeIn";
import PageHeader from "../components/PageHeader";
import ProjectCard from "../components/ProjectCard";
import images from "../assets/images";

/**
 * "Sweet" — Projects page.
 * Edit the `projects` array below to add your own projects.
 */

const projects = [
  {
    title: "Project Name One",
    desc: "A brief description of your project. Explain what it does and the tech stack.",
    tags: ["Python", "Flask", "API"],
    link: null,
  },
  {
    title: "Project Name Two",
    desc: "Another project description. Share what problem it solves.",
    tags: ["React", "JavaScript", "CSS"],
    link: null,
  },
  {
    title: "Project Name Three",
    desc: "A third project showcasing your skills.",
    tags: ["Java", "OOP", "Data Structures"],
    link: null,
  },
];

export default function ProjectsPage({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: "80px 40px 60px" }}>
      <BackButton onClick={onBack} />

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn delay={200}>
          <PageHeader
            title="Sweet"
            subtitle="Projects"
            imgSrc={images.sweet}
            imgW={40}
            imgH={40}
          />
        </FadeIn>

        {projects.map((project, i) => (
          <FadeIn key={i} delay={350 + i * 150}>
            <ProjectCard {...project} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
