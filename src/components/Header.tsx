import React, { useEffect, useRef, useState } from 'react';
import './Header.css';
import { useScroll } from 'framer-motion';
const SCROLLBAR_OFFSET = 50; // Pixels from top to consider section "passed"
const sections = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "services", label: "Our Services" },
    { id: "contact", label: "Contact Us" },
  ];
const Header: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const [sectionPositions, setSectionPositions] = useState<{
      [key: string]: number;
    }>({});
    
  useEffect(() => {
    const updateSectionPositions = () => {
      if (!containerRef.current) return;

      const positions: { [key: string]: number } = {};
      sections.forEach((section) => {
        const element = containerRef.current?.querySelector(`#${section.id}`);
        if (element) {
          positions[section.id] = Number(element.getBoundingClientRect().top.toFixed(1));
        }
      });
      setSectionPositions(positions);
    };

    updateSectionPositions();
    window.addEventListener("resize", updateSectionPositions);
    return () => window.removeEventListener("resize", updateSectionPositions);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      Object.entries(sectionPositions).forEach(([id, position]) => {
        const current = containerRef.current?.querySelector(`#${id}`);
        if (!current) return;
        
        // Only check direction if we're within the offset threshold
        // Check if we're within the scrollbar offset threshold
        if (Math.abs(position - latest) < SCROLLBAR_OFFSET) {
          const currentDir = position - latest > 0 ? "+" : "-";
          const lastDir = current.getAttribute("lastTriggerForDir");
          const hasExitedOffset = current.getAttribute("hasExitedOffset") === "true";
          
          // Only proceed if direction has changed and we've exited the offset zone before
          if (current.getAttribute("lastTriggerForDir") !== currentDir && (hasExitedOffset || !lastDir)) {
            console.log(`Triggering section: ${id}, direction: ${currentDir}, position: ${position}, scrollY: ${latest}`);
            current.setAttribute("lastTriggerForDir", currentDir);
            current.setAttribute("hasExitedOffset", "false");
            
            const link = current.querySelector("a")!;
            console.log(`Updating link text: ${link.innerText} -> ${link.innerText}!`);
            link.innerText+="!"
          }
        } else {
          // Mark that we've exited the offset zone
          current.setAttribute("hasExitedOffset", "true");
        }
      });
    });

    return () => unsubscribe();
  }, [scrollY, sectionPositions]);

  return (
    <header className="header">
      <div ref={containerRef} className="header-content">
        <h1>Sticky Header</h1>
        <nav>
          <ul>
            {sections.map((section) => (
              <li id={section.id} key={section.id}>
                <a href={`#${section.id}`}>{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;  