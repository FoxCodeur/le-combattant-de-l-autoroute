import React, { useState, useEffect } from "react";
import DiceRoll from "../DiceRoll/DiceRoll";
import "./RaceGame358.scss";

const MAX_SCORE = 24;

// SVG Jaguar icon (style voiture sportive jaune)
const JaguarIcon = () => (
  <svg
    width="40"
    height="24"
    viewBox="0 0 40 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="5"
      y="10"
      width="30"
      height="7"
      rx="3"
      fill="#FFD700"
      stroke="#AA8800"
      strokeWidth="1.5"
    />
    <rect
      x="12"
      y="6"
      width="16"
      height="8"
      rx="3"
      fill="#FFFACD"
      stroke="#999"
      strokeWidth="1"
    />
    <circle cx="12" cy="19" r="3" fill="#444" stroke="#222" strokeWidth="1" />
    <circle cx="28" cy="19" r="3" fill="#444" stroke="#222" strokeWidth="1" />
    <rect
      x="29"
      y="12"
      width="4"
      height="3"
      rx="1.2"
      fill="#FFD700"
      stroke="#AA8800"
      strokeWidth="1"
    />
    <rect
      x="7"
      y="12"
      width="4"
      height="3"
      rx="1.2"
      fill="#FFD700"
      stroke="#AA8800"
      strokeWidth="1"
    />
    <ellipse cx="20" cy="11" rx="7" ry="2" fill="#bba70a" opacity="0.28" />
  </svg>
);

// SVG Interceptor icon (style voiture musclée bleue)
const InterceptorIcon = () => (
  <svg
    width="40"
    height="24"
    viewBox="0 0 40 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="5"
      y="10"
      width="30"
      height="7"
      rx="3"
      fill="#37a9ff"
      stroke="#1b65a4"
      strokeWidth="1.5"
    />
    <rect
      x="13"
      y="7"
      width="14"
      height="7"
      rx="2.5"
      fill="#e0f6ff"
      stroke="#999"
      strokeWidth="1"
    />
    <circle cx="13" cy="19" r="3" fill="#222" stroke="#111" strokeWidth="1" />
    <circle cx="27" cy="19" r="3" fill="#222" stroke="#111" strokeWidth="1" />
    <rect
      x="31"
      y="12"
      width="4"
      height="3"
      rx="1.2"
      fill="#37a9ff"
      stroke="#1b65a4"
      strokeWidth="1"
    />
    <rect
      x="5"
      y="12"
      width="4"
      height="3"
      rx="1.2"
      fill="#37a9ff"
      stroke="#1b65a4"
      strokeWidth="1"
    />
    <ellipse cx="20" cy="11" rx="7" ry="2" fill="#37a9ff" opacity="0.18" />
  </svg>
);

const RaceGame358 = ({ chapterData, navigate }) => {
  const [raceStep, setRaceStep] = useState(0);
  const [jaguarScore, setJaguarScore] = useState(0);
  const [interceptorScore, setInterceptorScore] = useState(0);
  const [raceLog, setRaceLog] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);

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
    // eslint-disable-next-line
  }, [
    jaguarScore,
    interceptorScore,
    raceFinished,
    chapterData,
    navigate,
    raceStep,
  ]);

  const handleRaceRoll = (score) => {
    setIsRolling(false);
    if (raceFinished) return;
    if (raceStep % 2 === 0) {
      setJaguarScore((prev) => {
        const newScore = prev + score;
        setRaceLog((prevLog) => [
          ...prevLog,
          `Jaguar Type-E : +${score} (total ${newScore})`,
        ]);
        return newScore;
      });
    } else {
      setInterceptorScore((prev) => {
        const newScore = prev + score;
        setRaceLog((prevLog) => [
          ...prevLog,
          `Interceptor : +${score} (total ${newScore})`,
        ]);
        return newScore;
      });
    }
    setRaceStep((prev) => prev + 1);
  };

  // Calcule la position left (%) de l'icône voiture
  const carLeft = (score) =>
    `calc(${Math.min((score / MAX_SCORE) * 100, 100)}% - 20px)`;

  return (
    <section className="race-game358">
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
                <JaguarIcon />
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
                <InterceptorIcon />
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
