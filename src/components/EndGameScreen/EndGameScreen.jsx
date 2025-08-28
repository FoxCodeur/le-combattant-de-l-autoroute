import React, { useState, useRef, useEffect } from "react";
import "./EndGameScreen.scss";
import ending1 from "../../assets/images/00.webp";
import ending2 from "../../assets/images/01.webp";
import ending3 from "../../assets/images/02.webp";
import ending4 from "../../assets/images/03.webp";
import ending5 from "../../assets/images/04.webp";
import ending6 from "../../assets/images/05.webp";
import ending7 from "../../assets/images/06.webp";
import ending8 from "../../assets/images/07.webp";
import ending9 from "../../assets/images/08.webp";
import ending10 from "../../assets/images/09.webp";
import ending11 from "../../assets/images/10.webp";
import wastelandSound from "../../assets/sons/wasteland.mp3";

const images = [
  ending1,
  ending2,
  ending3,
  ending4,
  ending5,
  ending6,
  ending7,
  ending8,
  ending9,
  ending10,
  ending11,
];

const epilogue = [
  "Sur les ruines du vieux monde, tu as tracé ta route.",
  "Mais l’asphalte n’a pas dit son dernier mot.",
  "",
  "De nouveaux dangers, de nouveaux alliés, de nouveaux horizons t’attendent.",
  "",
  "Le voyage continue…",
  "",
  "À bientôt, combattant de l’autoroute.",
].join("\n");

function useTypewriter(text, speed = 50) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const charIdx = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    charIdx.current = 0;
    if (!text) return;

    const interval = setInterval(() => {
      charIdx.current++;
      setDisplayed(text.slice(0, charIdx.current));
      if (charIdx.current >= text.length) {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return [displayed, done];
}

const EndGameScreen = ({ onFinish }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showEpilogue, setShowEpilogue] = useState(false);
  const audioRef = useRef(null);

  const [typedText, typingDone] = useTypewriter(
    showEpilogue ? epilogue : "",
    50
  );

  // Joue le son wasteland.mp3 dès que le composant est monté
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, []);

  const handleNext = () => {
    if (index === images.length - 1) {
      setShowEpilogue(true);
    } else {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => Math.min(i + 1, images.length - 1));
        setFade(true);
      }, 400);
    }
  };

  const handleFinish = () => {
    if (onFinish) onFinish();
    else {
      localStorage.removeItem("selectedCharacter");
      localStorage.removeItem("characterData");
      window.location.href = "/";
    }
  };

  return (
    <div className="endgame-screen">
      {/* Balise audio pour wasteland.mp3 */}
      <audio ref={audioRef} src={wastelandSound} preload="auto" />
      {!showEpilogue && (
        <>
          <div className="endgame-image-wrapper">
            <img
              src={images[index]}
              alt={`Fin ${index + 1}`}
              className={`endgame-img${fade ? " fade-in" : " fade-out"}`}
            />
            {/* Effet de chaleur */}
            <div className="heat-haze-overlay"></div>
            <div className="heat-glow-overlay"></div>
          </div>
          <div className="endgame-controls">
            <button className="endgame-btn" onClick={handleNext}>
              {index < images.length - 1 ? "Suivant" : "Voir la conclusion"}
            </button>
            <div className="endgame-progress">
              {index + 1} / {images.length}
            </div>
          </div>
        </>
      )}
      {showEpilogue && (
        <div className="endgame-epilogue">
          <div className="endgame-epilogue-text">
            {typedText.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          {typingDone && (
            <button className="endgame-btn" onClick={handleFinish}>
              Terminer / Recommencer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EndGameScreen;
