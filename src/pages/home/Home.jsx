import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.scss";

const Home = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    setFadeOut(true);

    setTimeout(() => {
      navigate("/chapitre/0");
    }, 1000); // La transition dure 1 seconde
  };

  return (
    <div className="home">
      <div className={`home__content ${fadeOut ? "fade-out" : ""}`}>
        <img
          src="/images/le-combattant-de-l-autoroute.png"
          alt="Couverture du livre"
          className="home__image"
        />
        <h1 className="home__title">Le Livre Dont Vous Êtes Le Héros</h1>
        <p className="home__intro">
          Plongez dans l'aventure et faites vos choix pour écrire votre histoire
          !
        </p>
        <button className="home__button" onClick={handleStart}>
          Commencer
        </button>
      </div>
    </div>
  );
};

export default Home;
