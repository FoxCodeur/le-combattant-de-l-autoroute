import React, { useEffect, useState } from "react";
import "./ScrollToTopButton.scss";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 250);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
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
};

export default ScrollToTopButton;
