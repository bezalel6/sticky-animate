import { useEffect, useRef, useState } from "react";
import "./Scroll.css";

export default function ScrollAnimation() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerHeight = containerRect.height;
      const windowHeight = window.innerHeight;

      // Calculate how far the container has scrolled into view
      const scrollPosition = windowHeight - containerTop;
      const progress = Math.min(
        Math.max(scrollPosition / (containerHeight + windowHeight), 0),
        1
      );

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${scrollProgress * 100}%`,
            background: `linear-gradient(90deg, #4a90e2, #e24a90, #90e24a, #4a90e2)`,
            backgroundSize: "400% 100%",
            backgroundPosition: `${scrollProgress * 100}% 50%`,
          }}
        />
      </div>
      <div className="progress-text">{Math.round(scrollProgress * 100)}%</div>
    </div>
  );
}
