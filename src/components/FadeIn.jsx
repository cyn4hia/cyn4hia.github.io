import { useState, useEffect } from "react";

/**
 * fades + slides in after a delay.
 */
export default function FadeIn({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(25px)",
        transition:
          "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
