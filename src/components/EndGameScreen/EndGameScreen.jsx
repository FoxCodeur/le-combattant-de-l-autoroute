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

// Gutz endings & sounds
// Première image retirée : gutzBegin supprimée de la liste
import gutz00 from "../../assets/images/gutz00.webp";
import gutz01 from "../../assets/images/gutz01.webp";
import gutz02 from "../../assets/images/gutz02.webp";
import gutz03 from "../../assets/images/gutz03.webp";
import gutz04 from "../../assets/images/gutz04.webp";
import gutz05 from "../../assets/images/gutz05.webp";
import gutz06 from "../../assets/images/gutz06.webp";
import gutz07 from "../../assets/images/gutz07.webp";
import moteurCamion from "../../assets/sons/moteurCamion.mp3";
import soloGuitare from "../../assets/sons/soloGuitare.mp3";

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

// Spécifique à Gutz - gutzBegin supprimé de la séquence :
const gutzImages = [
  gutz00,
  gutz01,
  gutz02,
  gutz03,
  gutz04,
  gutz05,
  gutz06,
  gutz07,
];

const gutzEpilogue = [
  "Gutz regarde l’horizon, le moteur du camion encore chaud.",
  "Il sait que la route ne s’arrête jamais vraiment.",
  "",
  "Seul face au désert, il sourit : le voyage ne fait que commencer…",
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

const EndGameScreen = ({ onFinish, character }) => {
  // Décide si on est sur la fin de Gutz
  const isGutz = character && character.toLowerCase() === "gutz";
  const usedImages = isGutz ? gutzImages : images;
  const usedEpilogue = isGutz ? gutzEpilogue : epilogue;
  const mainAudio = isGutz ? moteurCamion : wastelandSound;

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showEpilogue, setShowEpilogue] = useState(false);

  const mainAudioRef = useRef(null);
  const guitareAudioRef = useRef(null);

  const [typedText, typingDone] = useTypewriter(
    showEpilogue ? usedEpilogue : "",
    50
  );

  // Joue le son d'ambiance approprié au montage
  useEffect(() => {
    if (mainAudioRef.current) {
      mainAudioRef.current.currentTime = 0;
      mainAudioRef.current.play();
      // Baisse le volume du camion si Gutz
      if (isGutz) {
        mainAudioRef.current.volume = 0.3; // Volume réduit à 30%
      }
    }
  }, [mainAudio, isGutz]);

  // Joue la guitare sur l'image gutz06 (index 6 de gutzImages, car début à gutz00)
  useEffect(() => {
    if (isGutz && index === 6 && guitareAudioRef.current) {
      guitareAudioRef.current.currentTime = 0;
      guitareAudioRef.current.play();
    }
  }, [isGutz, index]);

  const handleNext = () => {
    if (index === usedImages.length - 1) {
      setShowEpilogue(true);
    } else {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => Math.min(i + 1, usedImages.length - 1));
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
      {/* Balise audio pour son principal */}
      <audio ref={mainAudioRef} src={mainAudio} preload="auto" />
      {/* Son guitare uniquement pour Gutz */}
      {isGutz && (
        <audio ref={guitareAudioRef} src={soloGuitare} preload="auto" />
      )}
      {!showEpilogue && (
        <>
          <div className="endgame-image-wrapper">
            <img
              src={usedImages[index]}
              alt={`Fin ${index + 1}`}
              className={`endgame-img${fade ? " fade-in" : " fade-out"}`}
            />
            {/* Effet de chaleur */}
            <div className="heat-haze-overlay"></div>
            <div className="heat-glow-overlay"></div>
          </div>
          <div className="endgame-controls">
            <button className="endgame-btn" onClick={handleNext}>
              {index < usedImages.length - 1 ? "Suivant" : "Voir la conclusion"}
            </button>
            <div className="endgame-progress">
              {index + 1} / {usedImages.length}
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
