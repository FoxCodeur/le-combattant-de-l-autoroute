import React, { useState } from "react";
import "./OrionKeyPads.scss";

import orionImg from "../../assets/images/orion.webp";
import oneImg from "../../assets/images/1.webp";
import twoImg from "../../assets/images/2.webp";
import threeImg from "../../assets/images/3.webp";
import fourImg from "../../assets/images/4.webp";
import fiveImg from "../../assets/images/5.webp";
import sixImg from "../../assets/images/6.webp";
import sevenImg from "../../assets/images/7.webp";
import eightImg from "../../assets/images/8.webp";
import nineImg from "../../assets/images/9.webp";
import zeroImg from "../../assets/images/0.webp";
import validEnterImg from "../../assets/images/validEnter.webp";
import invalidEnterImg from "../../assets/images/invalidEnter.webp";

// Adapter les positions/tailles selon le visuel de orion.webp !
const overlays = [
  { key: "1", img: oneImg, className: "key-1" },
  { key: "2", img: twoImg, className: "key-2" },
  { key: "3", img: threeImg, className: "key-3" },
  { key: "4", img: fourImg, className: "key-4" },
  { key: "5", img: fiveImg, className: "key-5" },
  { key: "6", img: sixImg, className: "key-6" },
  { key: "7", img: sevenImg, className: "key-7" },
  { key: "8", img: eightImg, className: "key-8" },
  { key: "9", img: nineImg, className: "key-9" },
  { key: "0", img: zeroImg, className: "key-0" },
  { key: "ENTER", img: validEnterImg, className: "key-enter" },
];

const OrionKeypad = ({ isEnterValid }) => {
  const [highlightedKey, setHighlightedKey] = useState(null);

  // Affiche l'image ENTER valide/invalide
  const getOverlayImg = (key) => {
    if (key === "ENTER") {
      return isEnterValid ? validEnterImg : invalidEnterImg;
    }
    const found = overlays.find((k) => k.key === key);
    return found ? found.img : null;
  };

  return (
    <div className="orion-keypad">
      <img src={orionImg} alt="Orion keypad" className="orion-background" />

      {/* Overlay du chiffre cliqué */}
      {highlightedKey && (
        <img
          src={getOverlayImg(highlightedKey)}
          alt={highlightedKey}
          className={`overlay ${
            overlays.find((o) => o.key === highlightedKey)?.className || ""
          }`}
        />
      )}

      {/* Boutons cliquables, positionnés sur chaque touche */}
      {overlays.map(({ key, className }) => (
        <button
          key={key}
          className={`key-btn ${className}`}
          aria-label={`Touche ${key}`}
          onClick={() => setHighlightedKey(key)}
        />
      ))}
    </div>
  );
};

export default OrionKeypad;
