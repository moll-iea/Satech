import { useEffect, useRef } from "react";

/**
 * useScrollReveal
 * Adds the "visible" class to all .reveal elements inside
 * the returned containerRef when they enter the viewport.
 */
export function useScrollReveal(threshold = 0.12) {
  const containerRef = useRef(null);

  useEffect(() => {
    const elements = containerRef.current
      ? containerRef.current.querySelectorAll(".reveal")
      : document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold]);

  return containerRef;
}
