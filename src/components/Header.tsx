import { useScroll } from "framer-motion";
import React, { Ref, useEffect, useRef, useState } from "react";
import {
  normalizeTarget as $,
  FakeDomTarget,
  makeFakeDom,
} from "../make-fake-dom";
import "./Header.css";
type DOMRect = ReturnType<typeof getRect>;
const SCROLLBAR_OFFSET = 10; // Pixels from top to consider section "passed"
const ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "services", label: "Our Services" },
  { id: "contact", label: "Contact Us" },
];
class Direction {
  constructor(protected dir: "column" | "row") {}
  get() {
    return this.dir;
  }
  not() {
    return this.dir === "column" ? "row" : "column";
  }
}
const startingDir = new Direction("column");
function getRect(e: Element) {
  const rect = e.getBoundingClientRect();
  const { bottom, height, left, right, top, x, y, width } = rect;
  return { bottom, height, left, right, top, x, y, width };
}
function detailedDiff(
  id: string,
  actualPosition: DOMRect,
  targetPosition: DOMRect
) {
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
      { flexDirection: startingDir.not() },
      (target) => {
        const positions: { [id: string]: DOMRect } = {};
        Array.from(target.querySelectorAll(".item")).forEach((t) => {
          positions[t.id] = getRect(t);
        });
        return positions;
      }
    );
    if (!targetPositions) throw new Error();
  }
  console.log({ targetPositions });
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
  const containerRef = useRef<HTMLUListElement | HTMLDivElement>(null);
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
            animateElement(containerRef.current?.querySelector("ul"), id);
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
    <div className="container">
      <Skeleton
        headerContent={{
          style: {
            position: "absolute",
            top: "0",
            right: "0",
            bottom: "0",
            left: "0",
            margin: "auto",
            height: 0,
            overflow: "visible",
          },
        }}
        header={{
          ref: containerRef as Ref<HTMLDivElement> | undefined,
        }}
        navList={{
          style: { flexDirection: startingDir.get() },
        }}
      ></Skeleton>
      <Skeleton
        header={{ style: { zIndex: -1 } }}
        headerContent={{
          style: {
            display: "block",
            zIndex: -1,
          },
        }}
        navList={{
          style: { flexDirection: startingDir.get() },
        }}
      ></Skeleton>
    </div>
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
  return (
    <header className="header" {...header}>
      <div className="header-content" {...headerContent}>
        <h1>Sticky Header</h1>
        <nav {...nav}>
          <ul {...navList}>
            {ITEMS.map((item) => (
              <li className="item" {...items} id={item.id} key={item.id}>
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
