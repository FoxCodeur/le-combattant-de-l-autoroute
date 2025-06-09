import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import renderFormattedText from "../../utils/renderFormattedText";
import ChapterContext from "../../context/ChapterContext";
import StatNotificationContext from "../../context/StatNotificationContext";
import applyNarrativeModifiers from "../../utils/applyNarrativeModifiers";
import DiceRoll from "../DiceRoll/DiceRoll";
import CharacterSheetButton from "../CharacterSheetButton/CharacterSheetButton";
import Modal from "../Modal/Modal";
import CharacterSheet from "../CharacterSheet/CharacterSheet";
import StatChangeNotification from "../StatChangeNotification/StatChangeNotification";
import CombatEnnemis from "../CombatEnnemis/CombatEnnemis";
import TestContext from "../../context/TestContext";
import "./Chapter.scss";
import defaultPicture from "../../assets/images/defaultPicture.webp";

const Chapter = () => {
  // Récupère l'ID du chapitre depuis l'URL
  const { id } = useParams();
  const navigate = useNavigate();

  // Contextes partagés pour obtenir les données du chapitre, personnage, gestion des notifications, etc.
  const {
    chapterData,
    fetchChapter,
    loading,
    error,
    characterData,
    setCharacterData,
  } = useContext(ChapterContext);

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  const { diceTotal, validChoice, handleDiceResult, resetTest } =
    useContext(TestContext);

  // Charge un nouveau chapitre et réinitialise le test de dés à chaque changement d'ID de chapitre
  useEffect(() => {
    fetchChapter(id);
    resetTest();
    // eslint-disable-next-line
  }, [id]);

  // Applique les modificateurs narratifs (bonus/malus, etc.) du chapitre si présents
  useEffect(() => {
    if (
      chapterData &&
      chapterData.modificateursNarratifs &&
      typeof chapterData.modificateursNarratifs === "object" &&
      Object.keys(chapterData.modificateursNarratifs).length > 0 &&
      characterData &&
      setCharacterData
    ) {
      const safeCharacter = { ...characterData };
      if (!Array.isArray(safeCharacter.chapitresModifies)) {
        safeCharacter.chapitresModifies = [];
      }
      const chapterId = String(chapterData.id ?? id);
      if (!safeCharacter.chapitresModifies.includes(chapterId)) {
        const { character: updated, changes } = applyNarrativeModifiers(
          chapterData.modificateursNarratifs,
          safeCharacter
        );
        updated.chapitresModifies = [
          ...safeCharacter.chapitresModifies,
          chapterId,
        ];
        setCharacterData(updated);
        if (changes && changes.length > 0) {
          addNotifications(changes);
        }
      }
    }
    // eslint-disable-next-line
  }, [chapterData, characterData, setCharacterData, id, addNotifications]);

  // Remplace le placeholder {hero} par le nom du personnage dans les textes
  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

  // Gère le clic sur un choix (applique les modificateurs narratifs éventuels, change de chapitre)
  const handleChoiceClick = (choice) => {
    if (choice.modificateursNarratifs) {
      const { character, changes } = applyNarrativeModifiers(
        choice.modificateursNarratifs,
        characterData
      );
      setCharacterData(character);
      if (typeof addNotifications === "function") {
        addNotifications(changes);
      }
    }
    navigate(`/chapitre/${choice.next}`);
  };

  // Génère les boutons de choix à la fin du chapitre (avec ou sans test de dés)
  const renderChoices = () => {
    // Si test de dés requis, affiche un seul bouton selon le résultat du dé
    if (chapterData?.diceRoll?.required) {
      if (!diceTotal) {
        return <p>Veuillez lancer les dés pour continuer.</p>;
      }
      if (!validChoice) {
        return <p>Aucun choix disponible pour ce résultat de dé.</p>;
      }
      return (
        <button
          className="chapter-choice"
          onClick={() => handleChoiceClick(validChoice)}
        >
          {validChoice.label}
        </button>
      );
    }

    // Sinon, affiche tous les choix disponibles
    if (Array.isArray(chapterData?.choices)) {
      return chapterData.choices.map((choice, index) => (
        <button
          key={index}
          className="chapter-choice"
          onClick={() => handleChoiceClick(choice)}
        >
          {choice.label}
        </button>
      ));
    }
    return null;
  };

  return (
    <div
      className={`chapter chapter-${id}`}
      role="region"
      aria-label="Chapitre interactif"
    >
      {/* Notifications de changement de stats */}
      <StatChangeNotification notifications={notifications} />

      {/* Modale pour la fiche personnage */}
      <Modal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        {characterData ? (
          <CharacterSheet data={characterData} />
        ) : (
          <p>Chargement de la fiche personnage...</p>
        )}
      </Modal>

      {/* Gestion de l'état de chargement et d'erreur */}
      {loading && <p className="loading-message">Chargement du chapitre...</p>}
      {error && <div className="error-message">Erreur : {error}</div>}

      {/* Affichage principal du chapitre */}
      {!loading && !error && chapterData && chapterData.title ? (
        <article className="chapter-content">
          {/* Titre du chapitre */}
          <h1 className="chapter-title">
            {chapterData.title || "Titre manquant"}
          </h1>

          {/* Image du chapitre et bouton fiche personnage */}
          <div className="chapter-image-container">
            <img
              src={chapterData.image ? chapterData.image : defaultPicture}
              alt={`Illustration du chapitre : ${chapterData.title}`}
              className="chapter-image"
              onError={(e) => {
                e.target.src = defaultPicture;
              }}
            />
            <CharacterSheetButton onClick={() => setIsSheetOpen(true)} />
          </div>

          {/* Texte principal du chapitre (mise en forme custom) */}
          <section
            className={`chapter-text ${id === "0" ? "first-chapter" : ""}`}
          >
            {renderFormattedText(getPersonalizedText(chapterData.text))}
          </section>

          {/* Bloc combat si des ennemis sont présents */}
          {chapterData.combat?.ennemis && (
            <CombatEnnemis
              ennemis={chapterData.combat.ennemis}
              type={chapterData.combat.type}
            />
          )}

          {/* Section test de dés : affiche la description du test avec le rendu custom */}
          {chapterData.diceRoll?.required && (
            <section className="chapter-dice-test">
              {chapterData.testHabilete?.description && (
                <div className="habilete-description">
                  {renderFormattedText(chapterData.testHabilete.description)}
                </div>
              )}
              {!chapterData.testHabilete?.description &&
                chapterData.testChance?.description && (
                  <div className="chance-description">
                    {renderFormattedText(chapterData.testChance.description)}
                  </div>
                )}
              {diceTotal === null && (
                <DiceRoll
                  numberOfDice={chapterData.diceRoll.numberOfDice || 2}
                  onResult={(total) =>
                    handleDiceResult(total, chapterData, characterData)
                  }
                />
              )}
              {diceTotal !== null && (
                <p className="dice-result">Résultat du lancer : {diceTotal}</p>
              )}
            </section>
          )}

          {/* Boutons de choix pour l'utilisateur */}
          <nav className="chapter-choices" aria-label="Choix disponibles">
            {renderChoices()}
          </nav>
        </article>
      ) : (
        !loading &&
        !error && (
          <p className="error-message">
            Chapitre introuvable ou données invalides.
          </p>
        )
      )}
    </div>
  );
};

export default Chapter;
