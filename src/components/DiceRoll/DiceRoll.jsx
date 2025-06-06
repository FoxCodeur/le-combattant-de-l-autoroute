import React, { useState, useRef } from "react";
import gsap from "gsap";
import "./DiceRoll.scss";

const DiceRoll = ({ numberOfDice = 2, onResult }) => {
  const [diceResults, setDiceResults] = useState(Array(numberOfDice).fill(1));
  const [rolling, setRolling] = useState(false);
  const diceRefs = useRef([]);

  const rollDice = () => {
    if (rolling) return;

    setRolling(true);

    const results = Array.from(
      { length: numberOfDice },
      () => Math.floor(Math.random() * 6) + 1
    );

    // Anime chaque dé une seule fois
    diceRefs.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(
          el,
          { rotate: 0, scale: 1 },
          {
            rotate: "+=360",
            scale: 1.1,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.to(el, {
                scale: 1,
                y: -20,
                duration: 0.3,
                ease: "bounce.out",
                delay: 0.1 * i,
                onComplete: () => {
                  gsap.to(el, {
                    y: 0,
                    duration: 0.2,
                    ease: "bounce.out",
                  });
                },
              });
            },
          }
        );
      }
    });

    setTimeout(() => {
      setDiceResults(results);
      setRolling(false);

      const total = results.reduce((sum, val) => sum + val, 0);
      if (onResult) onResult(total);
    }, 600);
  };

  return (
    <div className="dice-roll">
      <button className="roll-button" onClick={rollDice} disabled={rolling}>
        {rolling ? "Lancer en cours..." : "Lancer les dés"}
      </button>

      <div className="dice-result">
        <p>Résultat :</p>
        <div className="dice-images">
          {diceResults.map((result, index) => (
            <img
              key={index}
              ref={(el) => (diceRefs.current[index] = el)}
              src={`/images/face${result}.png`}
              alt={`Dé face ${result}`}
              className="dice-image"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiceRoll;
