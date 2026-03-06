import { useState, useCallback } from "react";
import PageTransition from "./components/PageTransition";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import AboutPage from "./pages/AboutPage";
import InterestsPage from "./pages/InterestsPage";
import ContactPage from "./pages/ContactPage";

/**
 * Root app component.
 * Manages which page is active and renders transitions.
 */
export default function App() {
  const [page, setPage] = useState("home");
  const navigate = useCallback((p) => setPage(p), []);
  const goHome = useCallback(() => setPage("home"), []);

  return (
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
  );
}
