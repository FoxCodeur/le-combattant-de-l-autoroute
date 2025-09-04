import React from "react";
import "./VisitorCounter.scss";

function VisitorCounter() {
  return (
    <div className="visitor-counter">
      <img
        src="https://visitor-badge.glitch.me/badge?page_id=foxcodeur-livre-jeu"
        alt="Compteur de visiteurs"
        className="visitor-counter__badge"
      />
    </div>
  );
}

export default VisitorCounter;
