import React from "react";
import "./ScrollToTopButton.scss";

const ScrollToTopButton = () => (
  <button
    className="scroll-to-top-btn"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    aria-label="Remonter en haut de la page"
    type="button"
  >
    <img
      src="/images/deathButton.png"
      alt="Remonter en haut"
      className="scroll-to-top-img"
    />
  </button>
);

export default ScrollToTopButton;
