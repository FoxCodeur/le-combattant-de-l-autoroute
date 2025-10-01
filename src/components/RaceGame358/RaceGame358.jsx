import React, { useState, useEffect, useRef } from "react";
import DiceRoll from "../DiceRoll/DiceRoll";
import motorCarSound from "../../assets/sons/motorCar.mp3";
import jaguarImg from "../../assets/images/jaguar.webp";
import interceptorImg from "../../assets/images/interceptorCurse.webp";
import "./RaceGame358.scss";

const MAX_SCORE = 24;

const RaceGame358 = ({ chapterData, navigate }) => {
  const [raceStep, setRaceStep] = useState(0);
  const [jaguarScore, setJaguarScore] = useState(0);
  const [interceptorScore, setInterceptorScore] = useState(0);
  const [raceLog, setRaceLog] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);

  // Ajout du ref pour le son
  const motorCarAudioRef = useRef(null);

  const currentVehicle = raceStep % 2 === 0 ? "Jaguar Type-E" : "Interceptor";

  useEffect(() => {
    if (
      !raceFinished &&
      (jaguarScore >= MAX_SCORE || interceptorScore >= MAX_SCORE)
    ) {
      setRaceFinished(true);
      setTimeout(() => {
        let winner;
        if (jaguarScore >= MAX_SCORE && interceptorScore >= MAX_SCORE) {
          winner = raceStep % 2 === 1 ? "Jaguar" : "Interceptor";
        } else if (jaguarScore >= MAX_SCORE) {
          winner = "Jaguar";
        } else {
          winner = "Interceptor";
        }

        if (winner === "Jaguar") {
          const loseChoice = chapterData.choices.find((c) =>
            c.label.toLowerCase().includes("perd")
          );
          if (loseChoice) navigate(`/chapitre/${loseChoice.next}`);
        } else {
          const winChoice = chapterData.choices.find((c) =>
            c.label.toLowerCase().includes("emport")
          );
          if (winChoice) navigate(`/chapitre/${winChoice.next}`);
        }
      }, 1600);
    }
  }, [
    jaguarScore,
    interceptorScore,
    raceFinished,
    chapterData,
    navigate,
    raceStep,
  ]);

  // Joue le son à chaque lancement du dé
  const playMotorCarSound = () => {
    if (motorCarAudioRef.current) {
      motorCarAudioRef.current.currentTime = 0; // Reset pour rejouer
      motorCarAudioRef.current.play();
    }
  };

  const handleRaceRoll = (score) => {
    setIsRolling(false);
    if (raceFinished) return;
    // Joue le son ici
    playMotorCarSound();

    if (raceStep % 2 === 0) {
      const newScore = jaguarScore + score;
      setJaguarScore(newScore);
      setRaceLog((prevLog) => [
        ...prevLog,
        `Jaguar Type-E : +${score} (total ${newScore})`,
      ]);
    } else {
      const newScore = interceptorScore + score;
      setInterceptorScore(newScore);
      setRaceLog((prevLog) => [
        ...prevLog,
        `Interceptor : +${score} (total ${newScore})`,
      ]);
    }
    setRaceStep((prev) => prev + 1);
  };

  // Calcule la position left (%) de l'icône voiture
  const carLeft = (score) =>
    `calc(${Math.min((score / MAX_SCORE) * 100, 100)}% - 20px)`;

  return (
    <section className="race-game358">
      {/* Balise audio cachée */}
      <audio
        ref={motorCarAudioRef}
        src={motorCarSound}
        preload="auto"
        style={{ display: "none" }}
      />

      <h2>
        Course&nbsp;: <span className="vehicule-name">Jaguar Type-E</span> vs{" "}
        <span className="vehicule-name">Interceptor</span>
      </h2>
      <p>
        Lancez le dé pour la <strong>{currentVehicle}</strong>.
      </p>
      {/* PROGRESS BARS + VOITURES */}
      <div className="race-progress-bars">
        {/* Jaguar */}
        <div className="race-progress-row">
          <span className="vehicule-name">Jaguar Type-E.</span>
          <div className="race-bar-and-car">
            <div className="race-bar-outer">
              <div
                className="race-bar-inner jaguar"
                style={{
                  width: `${Math.min((jaguarScore / MAX_SCORE) * 100, 100)}%`,
                }}
              />
              <span className="race-bar-score">{jaguarScore}</span>
            </div>
            <div className="race-car-track">
              <div
                className="race-car-img jaguar"
                style={{ left: carLeft(jaguarScore) }}
              >
                <img
                  src={jaguarImg}
                  alt="Jaguar Type-E"
                  className="car-image"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Interceptor */}
        <div className="race-progress-row">
          <span className="vehicule-name">Interceptor-V8</span>
          <div className="race-bar-and-car">
            <div className="race-bar-outer">
              <div
                className="race-bar-inner interceptor"
                style={{
                  width: `${Math.min(
                    (interceptorScore / MAX_SCORE) * 100,
                    100
                  )}%`,
                }}
              />
              <span className="race-bar-score">{interceptorScore}</span>
            </div>
            <div className="race-car-track">
              <div
                className="race-car-img interceptor"
                style={{ left: carLeft(interceptorScore) }}
              >
                <img
                  src={interceptorImg}
                  alt="Interceptor"
                  className="car-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* END PROGRESS BARS */}

      {!raceFinished && (
        <div className="dice-roll-container">
          <DiceRoll
            numberOfDice={1}
            onResult={handleRaceRoll}
            disabled={isRolling}
          />
        </div>
      )}
      <ul>
        {raceLog.map((log, idx) => {
          const match = log.match(/^(.*?) : ([^()]+)\(total (\d+)\)$/);
          if (match) {
            return (
              <li key={idx}>
                <span className="vehicule-name">{match[1]}</span>
                {" : "}
                {match[2]}
                <span className="vehicule-total">(total {match[3]})</span>
              </li>
            );
          }
          return <li key={idx}>{log}</li>;
        })}
      </ul>
      <p className="score-summary">
        <span className="vehicule-name">Jaguar Type-E</span> :{" "}
        <span className="vehicule-score">{jaguarScore}</span> /{" "}
        <span className="vehicule-name">Interceptor</span> :{" "}
        <span className="vehicule-score">{interceptorScore}</span>
      </p>
      {raceFinished && (
        <div className="race-result">
          Résultat&nbsp;:{" "}
          {jaguarScore >= MAX_SCORE && interceptorScore >= MAX_SCORE
            ? raceStep % 2 === 1
              ? "La Jaguar l'emporte !"
              : "Votre Interceptor l'emporte !"
            : jaguarScore >= MAX_SCORE
            ? "La Jaguar l'emporte !"
            : "Votre Interceptor l'emporte !"}
        </div>
      )}
    </section>
  );
};

export default RaceGame358;
