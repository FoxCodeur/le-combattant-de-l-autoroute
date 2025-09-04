import React, { useEffect, useState } from "react";
import "./VisitorCounter.scss";

const COUNTER_KEY = "foxcodeur-livre-jeu"; // Change ce nom si tu veux un compteur distinct

function VisitorCounter() {
  const [visits, setVisits] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`https://api.tallycount.app/increment?key=${COUNTER_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") {
          setVisits(data.count);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, []);

  return (
    <div className="visitor-counter">
      <span className="visitor-counter__icon" role="img" aria-label="👥">
        👥
      </span>
      {error ? (
        <span className="visitor-counter__text">Compteur indisponible</span>
      ) : visits === null ? (
        "Chargement..."
      ) : (
        <span className="visitor-counter__text">
          {visits} joueurs ont tenté l’aventure !
        </span>
      )}
    </div>
  );
}

export default VisitorCounter;
