import { HTMLAttributes, useEffect } from "react";
import "./StickyHeader.css";
const Header = () => {
  useEffect(() => {
    document
      .querySelector("ol")!
      .addEventListener("transitionend", function (e) {
        if ((e.target as HTMLElement).tagName == "OL")
          this.classList.toggle("transitioned");
      });
  }, []);
  const OL = (attrs: HTMLAttributes<HTMLOListElement>) => (
    <ol {...attrs}>
      <li>
        <a href="">Nav 1</a>
      </li>
      <li>
        <a href="">Nav 2</a>
      </li>
      <li>
        <a href="">Nav 3</a>
      </li>
      <li>
        <a href="">Nav 4</a>
      </li>
    </ol>
  );
  return (
    <>
      <OL></OL>
      <OL style={{ display: "block", visibility: "hidden" }}></OL>

      <button>Toggle</button>
    </>
  );
};
export default Header;
