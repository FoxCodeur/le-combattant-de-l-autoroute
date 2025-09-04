import React, { useEffect, useState } from "react";
import "./VisitorCounter.scss";

const NAMESPACE = "foxcodeur-livre-jeu";
const KEY = "visites";

function VisitorCounter() {
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`)
      .then((res) => res.json())
      .then((data) => setVisits(data.value));
  }, []);

  return (
    <div className="visitor-counter">
      <span className="visitor-counter__icon" role="img" aria-label="👥">
        👥
      </span>
      {visits === null ? (
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
