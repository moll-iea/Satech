import { useEffect, useRef } from "react";

/**
 * useScrollReveal
 * Adds the "visible" class to all .reveal elements inside
 * the returned containerRef when they enter the viewport.
 */
export function useScrollReveal(threshold = 0.12) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current || document;
    const observedElements = new WeakSet();

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

    const observeElements = () => {
      root.querySelectorAll(".reveal").forEach((el) => {
        if (!observedElements.has(el)) {
          observedElements.add(el);
          observer.observe(el);
        }
      });
    };

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    if (containerRef.current) {
      mutationObserver.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    } else {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold]);

  return containerRef;
}
