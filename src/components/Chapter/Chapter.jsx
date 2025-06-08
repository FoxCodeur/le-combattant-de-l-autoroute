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
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchChapter(id);
    resetTest();
    // eslint-disable-next-line
  }, [id]);

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

  // Utilitaire pour normaliser une chaîne (pratique pour les comparaisons sans accent)
  const normalize = (str) =>
    str && typeof str === "string"
      ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : "";

  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

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

  // Génère dynamiquement le bouton de choix à la fin du chapitre selon le contexte
  const renderChoices = () => {
    // Si test de dés requis, on n'affiche le choix que si validChoice existe
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

    // Sinon, on affiche tous les choix (pas de test, ou chapitre standard)
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
      <StatChangeNotification notifications={notifications} />

      <Modal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        {characterData ? (
          <CharacterSheet data={characterData} />
        ) : (
          <p>Chargement de la fiche personnage...</p>
        )}
      </Modal>

      {loading && <p className="loading-message">Chargement du chapitre...</p>}
      {error && <div className="error-message">Erreur : {error}</div>}

      {!loading && !error && chapterData && chapterData.title ? (
        <article className="chapter-content">
          <h1 className="chapter-title">
            {chapterData.title || "Titre manquant"}
          </h1>

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

          <section
            className={`chapter-text ${id === "0" ? "first-chapter" : ""}`}
          >
            {renderFormattedText(getPersonalizedText(chapterData.text))}
          </section>

          {chapterData.combat?.ennemis && (
            <CombatEnnemis
              ennemis={chapterData.combat.ennemis}
              type={chapterData.combat.type}
            />
          )}

          {chapterData.diceRoll?.required && (
            <section className="chapter-dice-test">
              {chapterData.testHabilete?.description && (
                <p className="habilete-description">
                  {chapterData.testHabilete.description}
                </p>
              )}
              {!chapterData.testHabilete?.description &&
                chapterData.testChance?.description && (
                  <p className="chance-description">
                    {chapterData.testChance.description}
                  </p>
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
