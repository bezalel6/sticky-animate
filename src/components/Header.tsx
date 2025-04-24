import { useScroll } from "framer-motion";
import React, { Ref, RefObject, useEffect, useRef, useState } from "react";
import {
  FakeDomTarget,
  makeFakeDom,
  normalizeTarget as $,
} from "../make-fake-dom";
import { mergeProps } from "../utils/mergeProps";
import "./Header.css";
const SCROLLBAR_OFFSET = 10; // Pixels from top to consider section "passed"
const ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "services", label: "Our Services" },
  { id: "contact", label: "Contact Us" },
];
function detailedDiff(id: string, targetPosition: DOMRect) {
  const actualElement = document.querySelector(`#${id}`);
  const actualPosition = actualElement?.getBoundingClientRect();

  // Calculate the difference between fake and actual positions
  const diff =
    actualPosition && targetPosition
      ? {
          top: (targetPosition.top - actualPosition.top).toFixed(2),
          left: (targetPosition.left - actualPosition.left).toFixed(2),
          width: (targetPosition.width - actualPosition.width).toFixed(2),
          height: (targetPosition.height - actualPosition.height).toFixed(2),
        }
      : null;

  console.log("Position diff for", id, {
    fake: targetPosition,
    actual: actualPosition,
    diff,
  });
  return diff;
}
let targetPositions: { [id: string]: DOMRect } | null = null;
function animateElement(container: FakeDomTarget, targetId: string) {
  if (targetPositions === null) {
    targetPositions = makeFakeDom(
      container,
      { flexDirection: "row" },
      (target) => {
        const positions: { [id: string]: DOMRect } = {};
        Array.from(target.querySelectorAll(".section")).forEach((t) => {
          positions[t.id] = t.getBoundingClientRect();
        });
        return positions;
      }
    );
    if (!targetPositions) throw new Error();
  }
  const targetPosition = targetPositions[targetId];
  const element = $(targetId, "#");
  if (targetPosition && element && !element.getAttribute("messed")) {
    element.setAttribute("messed", "true");

    // Set initial position
    element.style.position = "absolute";

    const diff = detailedDiff(targetId, targetPosition);
    element.style.transition = "all 1.3s ease-in-out";
    // Apply the animation
    requestAnimationFrame(() => {
      element.style.transform = `translate(${diff?.left}px, ${diff?.top}px)`;
    });
  } else {
    console.warn(
      `Could not animate ${targetId}: element or position not found`
    );
  }
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
      ITEMS.forEach((section) => {
        const element = containerRef.current?.querySelector(`#${section.id}`);
        if (element) {
          positions[section.id] = Number(
            element.getBoundingClientRect().top.toFixed(1)
          );
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
          const hasExitedOffset =
            current.getAttribute("hasExitedOffset") === "true";

          // Only proceed if direction has changed and we've exited the offset zone before
          if (
            current.getAttribute("lastTriggerForDir") !== currentDir &&
            (hasExitedOffset || !lastDir)
          ) {
            console.log(
              `Triggering section: ${id}, direction: ${currentDir}, position: ${position}, scrollY: ${latest}`
            );
            current.setAttribute("lastTriggerForDir", currentDir);
            current.setAttribute("hasExitedOffset", "false");
            animateElement(containerRef, id);
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
    <>
      <Skeleton></Skeleton>
      <Skeleton
        header={{ style: { display: "block", visibility: "hidden" } }}
      ></Skeleton>
    </>
  );
};
type SkeletonStructure = {
  header: HTMLDivElement;
  headerContent: HTMLDivElement;
  nav: HTMLElement;
  navList: HTMLUListElement;
  items: {
    [id: string]: HTMLLIElement;
  };
};

// Utility type that maps a key to its props type
type ElementProps<T extends keyof SkeletonStructure> = React.HTMLProps<
  SkeletonStructure[T]
>;

type SkeletonProps = {
  [P in keyof SkeletonStructure]: ElementProps<P>;
};

// Generic component must take `props` of type SkeletonProps<K>
const Skeleton = ({
  header,
  headerContent,
  nav,
  navList,
  items,
}: Partial<SkeletonProps>) => {
  const mergedHeader = mergeProps({ className: "header" }, header || {});
  const mergedHeaderContent = mergeProps(
    { className: "header-content" },
    headerContent || {}
  );
  const mergedNav = mergeProps(nav || {});
  const mergedNavList = mergeProps(
    { style: { position: "relative" } },
    navList || {}
  );
  const mergedItems = mergeProps({ className: "item" }, items || {});

  return (
    <header {...mergedHeader}>
      <div {...mergedHeaderContent}>
        <h1>Sticky Header</h1>
        <nav {...mergedNav}>
          <ul {...(mergedNavList as React.HTMLAttributes<HTMLUListElement>)}>
            {ITEMS.map((item) => (
              <li {...mergedItems} id={item.id} key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
