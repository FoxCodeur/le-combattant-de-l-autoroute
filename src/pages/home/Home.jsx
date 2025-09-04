import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AdventureCard from "../../components/AdventureCard/AdventureCard";
import NewGameButton from "../../components/NewGameButton/NewGameButton";
import skarrImg from "../../assets/images/skarr.webp";
import nyxImg from "../../assets/images/nyx.webp";
import gutzImg from "../../assets/images/gutz.webp";
import "./Home.scss";
import ChapterContext from "../../context/ChapterContext"; // Ajout pour récupérer selectCharacter
import VisitorCounter from "../../components/VisitorCounter/VisitorCounter";

const Home = () => {
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);
  const { selectCharacter } = useContext(ChapterContext); // Ajout

  // Cette fonction enregistre le nom du personnage dans le localStorage,
  // efface l'ancienne fiche, et force la notification du context
  const handleStart = (characterName) => {
    if (typeof selectCharacter === "function") {
      selectCharacter(characterName); // Utilise la fonction du provider pour tout gérer proprement
    } else {
      localStorage.setItem("selectedCharacter", characterName);
      localStorage.removeItem("characterData"); // <-- indispensable pour réinitialiser la fiche
      window.dispatchEvent(new Event("storage"));
    }
    navigate("/chapitre/0");
  };

  const handleShowCards = () => setShowCards(true);

  return (
    <div className="home">
      <div className="home__content">
        <img
          src="/images/le-combattant-de-l-autoroute.webp"
          alt="Couverture du livre"
          className="home__image"
        />
        <h1 className="home__title">Le Livre Dont Vous Êtes Le Héros</h1>
        <VisitorCounter />
        <p className="home__intro">
          Plongez dans l'aventure et faites vos choix pour écrire votre histoire
          !
        </p>
        {!showCards && (
          <div className="home__start-button">
            <NewGameButton onClick={handleShowCards}>Commencer</NewGameButton>
          </div>
        )}
      </div>

      {showCards && (
        <div className="home__cards-overlay">
          <div className="home__cards">
            <AdventureCard
              image={skarrImg}
              title="SKARR"
              age={44}
              description="Ancien militaire d’élite, Skarr a perdu un œil lors d’une mission qui a mal tourné. Solitaire, il s’est reconverti en instructeur d’auto-défense avant de devenir le protecteur pragmatique et loyal de Waco. Dans ce nouveau monde, il sait que la moindre faiblesse se paie cher."
            >
              <NewGameButton onClick={() => handleStart("Skarr")}>
                New Game
              </NewGameButton>
            </AdventureCard>

            <AdventureCard
              image={nyxImg}
              title="NYX"
              age={30}
              description="Promise à une brillante carrière de tennis, Nyx a grandi entre les continents. Après l’épidémie, elle a mis sa discipline et son optimisme au service de la survie. Figure audacieuse de Waco, elle inspire ceux qui croient encore en un avenir meilleur."
            >
              <NewGameButton onClick={() => handleStart("Nyx")}>
                New Game
              </NewGameButton>
            </AdventureCard>

            <AdventureCard
              image={gutzImg}
              title="GUTZ"
              age={34}
              description="Gutz, ancien hacker, profitait du chaos pour s'enrichir par ses arnaques. Il rejoint Waco, où ses talents en piratage et bricolage high-tech sont précieux, même si ses méthodes ne plaisent pas. Ni héros ni salaud : il fait juste ce qu’il faut pour survivre dans ce nouveau monde."
            >
              <NewGameButton onClick={() => handleStart("Gutz")}>
                New Game
              </NewGameButton>
            </AdventureCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
