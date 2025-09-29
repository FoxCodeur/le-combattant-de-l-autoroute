import React, { useState, useRef } from "react";
import image1 from "../../assets/images/OrionPortable.webp";
import image2 from "../../assets/images/OrionPortable2.webp";
import image3 from "../../assets/images/Orionportable3.webp"; // Vérifie bien la casse !
import mouseClick from "../../assets/sons/mouse-click.mp3";
import OrionLoginPanel from "../OrionLoginPanel/OrionLoginPanel";
import "./OrionPortableImage.scss";

const DELAY_1 = 400;
const DELAY_2 = 250;

const OrionPortableImage = () => {
  const [step, setStep] = useState(0);
  const audioRef = useRef(null);

  const handleClick = () => {
    if (step === 0) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setStep(1);
      setTimeout(() => {
        setStep(2);
        setTimeout(() => setStep(3), DELAY_2);
      }, DELAY_1);
    }
  };

  const handleLogin = (value) => {
    if (value === "1234") {
      alert("Accès autorisé !");
    } else {
      alert("Accès refusé !");
    }
  };

  return (
    <div className="orion-portable-container" onClick={handleClick}>
      <img
        src={image1}
        alt="ORION veille"
        className={`orion-portable-img ${step === 0 ? "visible" : ""} ${
          step >= 1 ? "fade-out" : ""
        }`}
        style={{ zIndex: 3 }}
        draggable={false}
      />
      <img
        src={image2}
        alt="Écran noir"
        className={`orion-portable-img ${step <= 1 ? "visible" : ""} ${
          step === 2 ? "fade-out" : ""
        }`}
        style={{ zIndex: 2 }}
        draggable={false}
      />
      <img
        src={image3}
        alt="Interface ORION"
        className={`orion-portable-img visible ${step === 3 ? "top" : ""}`}
        style={{ zIndex: 1 }}
        draggable={false}
      />
      {step === 0 && (
        <div className="orion-portable-overlay">
          <span>Cliquer pour sortir de veille</span>
        </div>
      )}
      {step === 3 && <OrionLoginPanel onLogin={handleLogin} />}
      <audio ref={audioRef} src={mouseClick} />
    </div>
  );
};
export default OrionPortableImage;
