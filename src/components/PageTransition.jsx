import { useState, useEffect } from "react";

/**
 * Wraps a page with enter/exit transitions.
 * When `isVisible` becomes true the page fades + slides in;
 * when it becomes false the page fades out then unmounts.
 */
export default function PageTransition({ isVisible, children }) {
  const [mounted, setMounted] = useState(false);
  const [anim, setAnim] = useState("hidden");

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnim("entering"));
      });
      const t = setTimeout(() => setAnim("visible"), 700);
      return () => clearTimeout(t);
    } else if (mounted) {
      setAnim("exiting");
      const t = setTimeout(() => {
        setMounted(false);
        setAnim("hidden");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isVisible, mounted]);

  if (!mounted) return null;

  const styles = {
    hidden: { opacity: 0, transform: "translateY(60px)" },
    entering: { opacity: 1, transform: "translateY(0)" },
    visible: { opacity: 1, transform: "translateY(0)" },
    exiting: { opacity: 0, transform: "translateY(-40px)" },
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        background: "#fff",
        overflowY: "auto",
        transition:
          "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        ...styles[anim],
      }}
    >
      {children}
    </div>
  );
}
