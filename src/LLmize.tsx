import { RefObject } from "react";
import { useScroll } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import "./Header.css";

type Selector = string;
export type FakeDomTarget = Selector | Element | RefObject<Element | null>;

export function normalizeTarget(target: FakeDomTarget): HTMLElement | null {
  let targetElement: Element | null = null;

  if (typeof target === "string") {
    targetElement = document.querySelector(target);
  } else if (target instanceof Element) {
    targetElement = target;
  } else if (target && "current" in target) {
    targetElement = target.current;
  }

  return targetElement instanceof HTMLElement ? targetElement : null;
}

const SCROLLBAR_OFFSET = 10;
const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "services", label: "Our Services" },
  { id: "contact", label: "Contact Us" },
];

let targetPositions: { [id: string]: DOMRect } | null = null;

function calculateTargetPositions(
  container: HTMLElement
): { [id: string]: DOMRect } | null {
  const computedStyle = window.getComputedStyle(container);
  const originalDisplay = computedStyle.display;
  const originalFlexDirection = computedStyle.flexDirection;

  // Apply temporary styles to calculate row positions
  container.style.display = "flex";
  container.style.flexDirection = "row";
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  container.offsetHeight; // Force reflow

  const positions: { [id: string]: DOMRect } = {};

  Array.from(container.querySelectorAll(".section")).forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const relativeLeft = elementRect.left - containerRect.left;
    const relativeTop = elementRect.top - containerRect.top;

    positions[element.id] = new DOMRect(
      relativeLeft,
      relativeTop,
      elementRect.width,
      elementRect.height
    );
  });

  // Revert styles
  container.style.display = originalDisplay;
  container.style.flexDirection = originalFlexDirection;

  return positions;
}

function animateElement(container: FakeDomTarget, targetId: string) {
  const containerElement = normalizeTarget(container);
  if (!containerElement) return;

  // Calculate target positions once
  if (!targetPositions) {
    targetPositions = calculateTargetPositions(containerElement);
    if (!targetPositions) return;
  }

  const targetPosition = targetPositions[targetId];
  const element = containerElement.querySelector(`#${targetId}`);
  if (!element || !(element instanceof HTMLElement)) return;

  if (targetPosition && !element.dataset.messed) {
    element.dataset.messed = "true";

    // Current position relative to parent
    const containerRect = containerElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const initialX = elementRect.left - containerRect.left;
    const initialY = elementRect.top - containerRect.top;

    // Target position from calculated row layout
    const targetX = targetPosition.left - initialX;
    const targetY = targetPosition.top;

    // Apply initial position
    element.style.position = "absolute";
    element.style.transform = `translate(${initialX}px, ${initialY}px)`;

    // Animate to target
    requestAnimationFrame(() => {
      element.style.transition = "transform 1.3s ease-in-out";
      element.style.transform = `translate(${targetX}px, ${targetY}px)`;
    });
  }
}
function animateElements(container: FakeDomTarget, targetIds: string[]) {
  const containerElement = normalizeTarget(container);
  if (!containerElement || targetIds.length === 0) return;

  // Calculate target positions once
  if (!targetPositions) {
    targetPositions = calculateTargetPositions(containerElement);
    if (!targetPositions) return;
  }

  // Batch read: Capture initial positions for all elements first
  const elements = targetIds
    .map((id) => {
      const el = containerElement.querySelector(`#${id}`);
      return el instanceof HTMLElement ? el : null;
    })
    .filter(Boolean) as HTMLElement[];

  const initialPositions = elements.map((element) => {
    const containerRect = containerElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return {
      element,
      initialX: elementRect.left - containerRect.left,
      initialY: elementRect.top - containerRect.top,
    };
  });

  // Batch write: Apply initial positions to all elements
  elements.forEach((element, index) => {
    const { initialX, initialY } = initialPositions[index];
    element.style.position = "absolute";
    element.style.transform = `translate(${initialX}px, ${initialY}px)`;
    element.style.transition = "transform 1.3s ease-in-out";
  });

  // Apply target transforms in next frame
  requestAnimationFrame(() => {
    elements.forEach((element) => {
      const targetPosition = targetPositions![element.id];
      if (!targetPosition) return;

      const targetX = targetPosition.left;
      const targetY = targetPosition.top;
      element.style.transform = `translate(${targetX}px, ${targetY}px)`;
    });
  });
}

const Header: React.FC = () => {
  const containerRef = useRef<HTMLUListElement>(null);
  const { scrollY } = useScroll();
  const [sectionPositions, setSectionPositions] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    const updateSectionPositions = () => {
      if (!containerRef.current) return;

      const positions: { [key: string]: number } = {};
      sections.forEach(({ id }) => {
        const element = containerRef.current?.querySelector(`#${id}`);
        if (element) {
          positions[id] = element.getBoundingClientRect().top;
        }
      });
      setSectionPositions(positions);
    };

    updateSectionPositions();
    window.addEventListener("resize", updateSectionPositions);
    return () => window.removeEventListener("resize", updateSectionPositions);
  }, []);

  // In the scroll handler:
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const elementsToAnimate: string[] = [];

      Object.entries(sectionPositions).forEach(([id, position]) => {
        const element = containerRef.current?.querySelector(`#${id}`);
        if (!element) return;

        if (Math.abs(position - latest) < SCROLLBAR_OFFSET) {
          const currentDir = position > latest ? "+" : "-";
          const lastDir = element.getAttribute("data-dir");
          const hasExited = element.getAttribute("data-exited") === "true";

          if (lastDir !== currentDir && (hasExited || !lastDir)) {
            elementsToAnimate.push(id);
            element.setAttribute("data-dir", currentDir);
            element.setAttribute("data-exited", "false");
          }
        } else {
          element.setAttribute("data-exited", "true");
        }
      });

      if (elementsToAnimate.length > 0) {
        animateElements(containerRef, elementsToAnimate);
      }
    });

    return () => unsubscribe();
  }, [scrollY, sectionPositions]);
  return (
    <header className="header">
      <div className="header-content">
        <h1>Sticky Header</h1>
        <nav>
          <ul ref={containerRef} style={{ position: "relative" }}>
            {sections.map(({ id, label }) => (
              <li key={id} id={id} className="section">
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
