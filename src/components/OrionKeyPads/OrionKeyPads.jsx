import React, { useState, useRef } from "react";
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

import keySound from "../../assets/sons/keySound.mp3";
import successSound from "../../assets/sons/success.mp3";

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

const OrionKeypad = ({ onSuccess }) => {
  const [highlightedKey, setHighlightedKey] = useState(null);
  const [enteredCode, setEnteredCode] = useState([]);
  const [enterActive, setEnterActive] = useState(false);
  const [isValid, setIsValid] = useState(null);

  const SECRET_CODE = ["4", "3", "1"];

  const keyAudioRef = useRef(null);
  const successAudioRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

  const playKeySound = () => {
    if (keyAudioRef.current) {
      keyAudioRef.current.currentTime = 0;
      keyAudioRef.current.play();
    }
  };

  const playSuccessSoundAndThenRedirect = () => {
    if (successAudioRef.current) {
      successAudioRef.current.currentTime = 0;
      successAudioRef.current.play();
      // Redirection après la fin du son
      successAudioRef.current.onended = () => {
        if (typeof onSuccess === "function") onSuccess();
      };
    } else {
      // Sécurité : si l’audio ne marche pas, on redirige quand même
      if (typeof onSuccess === "function") onSuccess();
    }
  };

  const getOverlayImg = (key) => {
    if (key === "ENTER") {
      if (isValid === true) return validEnterImg;
      if (isValid === false) return invalidEnterImg;
      return validEnterImg;
    }
    const found = overlays.find((k) => k.key === key);
    return found ? found.img : null;
  };

  const handleBtnClick = (key) => {
    setHighlightedKey(key);
    playKeySound();

    if (key === "ENTER") {
      if (enteredCode.length === 3) {
        const isGood =
          enteredCode[0] === SECRET_CODE[0] &&
          enteredCode[1] === SECRET_CODE[1] &&
          enteredCode[2] === SECRET_CODE[2];
        setIsValid(isGood);
        setEnterActive(true);

        if (isGood) {
          playSuccessSoundAndThenRedirect();
        }

        // Si code incorrect : reset après délai
        if (!isGood) {
          redirectTimeoutRef.current = setTimeout(() => {
            setEnterActive(false);
            setHighlightedKey(null);
            setEnteredCode([]);
            setIsValid(null);
          }, 900);
        }
      }
      return;
    }

    if (enteredCode.length >= 3 || enterActive) return;

    setEnteredCode((prev) => {
      const next = [...prev, key];
      setIsValid(null);
      return next;
    });
  };

  // Nettoyage du timeout si le composant démonte
  React.useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const renderCodeDots = () => (
    <div className="keypad-code-dots">
      {[0, 1, 2].map((i) => (
        <span key={i} className="dot">
          {enteredCode[i] ? "•" : ""}
        </span>
      ))}
    </div>
  );

  return (
    <div className="orion-keypad">
      <img src={orionImg} alt="Orion keypad" className="orion-background" />

      {/* Audios */}
      <audio ref={keyAudioRef} src={keySound} preload="auto" />
      <audio ref={successAudioRef} src={successSound} preload="auto" />

      {renderCodeDots()}

      {highlightedKey && (
        <img
          src={getOverlayImg(highlightedKey)}
          alt={highlightedKey}
          className={`overlay ${
            overlays.find((o) => o.key === highlightedKey)?.className || ""
          }`}
        />
      )}

      {overlays.map(({ key, className }) => (
        <button
          key={key}
          className={`key-btn ${className}`}
          aria-label={`Touche ${key}`}
          onClick={() => handleBtnClick(key)}
          disabled={
            (key === "ENTER" && enteredCode.length !== 3) ||
            (key !== "ENTER" && enteredCode.length >= 3) ||
            enterActive
          }
        />
      ))}

      <div className="indicator-lights">
        <span
          className={`indicator-light light-yellow${
            isValid === true ? " on" : ""
          }`}
          title="Lumière jaune"
        />
        <span
          className={`indicator-light light-red${
            isValid === false ? " on" : ""
          }`}
          title="Lumière rouge"
        />
      </div>
    </div>
  );
};

export default OrionKeypad;
