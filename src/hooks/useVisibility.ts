import { useRef, useEffect, useState } from 'react';

/**
 * useVisibility - IntersectionObserver hook for pausing off-screen animations
 *
 * Returns both a reactive state (for controlling effects/intervals) and a
 * stable ref (for checking inside rAF loops without triggering re-renders).
 */
export function useVisibility(containerRef: React.RefObject<Element | null>): {
  isVisible: boolean;
  visibleRef: React.MutableRefObject<boolean>;
} {
  const [isVisible, setIsVisible] = useState(true);
  const visibleRef = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  return { isVisible, visibleRef };
}
