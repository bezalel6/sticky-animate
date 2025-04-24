import { RefObject } from "react";
type Selector = string;
export type FakeDomTarget = Selector | Element | RefObject<Element | null>;
export function normalizeTarget(target: FakeDomTarget, prefix: string = "") {
  // Get the target element
  let targetElement: Element | null = null;

  if (typeof target === "string") {
    // If target is a CSS selector
    targetElement = document.querySelector(prefix + target);
  } else if (target instanceof Element) {
    // If target is a DOM element
    targetElement = target;
  } else if (target && "current" in target && target.current) {
    // If target is a React ref
    targetElement = target.current;
  }

  if (!(targetElement instanceof HTMLElement)) return null;
  return targetElement;
}
export function makeFakeDom<T>(
  messyTarget: FakeDomTarget,
  styles: React.CSSProperties,
  callback: (node: HTMLElement) => T
): T | null {
  const target = normalizeTarget(messyTarget);
  if (!target) return null;
  // Clone the element and its children
  const clone = target.cloneNode(true) as HTMLElement;

  // Create a hidden container
  const container = document.createElement("div");
  Object.assign(container.style, {
    // position: "fixed",
    // left: "-9999px",
    // visibility: "hidden",
  });

  // Append elements to DOM
  target.parentElement?.append(target, container);
  container.appendChild(clone);

  // Apply temporary styles
  Object.assign(clone.style, styles);

  // Calculate the result
  const computedValue = callback(clone);

  // Cleanup DOM changes
  container.remove();
  return computedValue;
}
