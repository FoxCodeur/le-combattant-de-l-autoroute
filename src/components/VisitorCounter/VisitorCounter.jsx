import React, { useEffect, useState } from "react";
import "./VisitorCounter.scss";

// Utilise un identifiant unique pour ton livre-jeu
const COUNTER_ID = "foxcodeur_livre_jeu";

function VisitorCounter() {
  const [visits, setVisits] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // TinyCounter API : incrémente et récupère la valeur
    fetch(`https://api.tinycounter.com/count?key=${COUNTER_ID}`)
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
