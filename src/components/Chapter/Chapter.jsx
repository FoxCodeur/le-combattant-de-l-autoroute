import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import renderFormattedText from "../../utils/renderFormattedText";
import ChapterContext from "../../context/ChapterContext";
import DiceRoll from "../DiceRoll/DiceRoll";
import "./Chapter.scss";
import CharacterSheetButton from "../CharacterSheetButton/CharacterSheetButton";
import Modal from "../Modal/Modal";
import CharacterSheet from "../CharacterSheet/CharacterSheet";
import defaultPicture from "../../assets/images/defaultPicture.webp";
import applyNarrativeModifiers from "../../utils/applyNarrativeModifiers";
import StatChangeNotification from "../StatChangeNotification/StatChangeNotification";
import StatNotificationContext from "../../context/StatNotificationContext";
import CombatEnnemis from "../CombatEnnemis/CombatEnnemis";

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

  const [diceTotal, setDiceTotal] = useState(null);
  const [validChoice, setValidChoice] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Notifications via context
  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  // Charge le chapitre en fonction de l'id
  useEffect(() => {
    fetchChapter(id);
    setDiceTotal(null);
    setValidChoice(null);
  }, [id, fetchChapter]);

  // Applique les modificateurs narratifs une seule fois par chapitre et affiche les notifications
  useEffect(() => {
    if (
      chapterData &&
      chapterData.modificateursNarratifs &&
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

        // Ajoute toutes les notifications via le context (séquencées automatiquement)
        if (changes && changes.length > 0) {
          addNotifications(changes);
        }
      }
    }
    // eslint-disable-next-line
  }, [chapterData, characterData, setCharacterData, id, addNotifications]);

  const handleChoiceClick = (nextChapterId) => {
    if (nextChapterId) {
      navigate(`/chapitre/${nextChapterId}`);
    }
  };

  // Normalise les accents pour la gestion des choix
  const normalize = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Remplace {hero} par le nom du personnage
  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

  // Gestion des tests de hasard, chance et habileté
  const handleDiceResult = (total) => {
    setDiceTotal(total);

    // Test d'habileté
    if (chapterData.testHabilete?.required && characterData) {
      const habilete = characterData.caractéristiques.habilete;
      let matchedChoice = null;

      if (chapterData.choices && Array.isArray(chapterData.choices)) {
        if (total <= habilete) {
          matchedChoice = chapterData.choices.find((choice) =>
            normalize(choice.label.toLowerCase()).includes("reuss")
          );
        } else {
          matchedChoice = chapterData.choices.find((choice) => {
            const label = normalize(choice.label.toLowerCase());
            return label.includes("echec") || label.includes("echou");
          });
        }
      }
      setValidChoice(matchedChoice || null);
      return;
    }

    // Test de chance
    if (chapterData.testChance?.required && characterData) {
      const chance = characterData.caractéristiques.chance;
      let matchedChoice = null;

      if (chapterData.choices && Array.isArray(chapterData.choices)) {
        if (total <= chance) {
          matchedChoice = chapterData.choices.find((choice) =>
            normalize(choice.label.toLowerCase()).includes("reuss")
          );
        } else {
          matchedChoice = chapterData.choices.find((choice) => {
            const label = normalize(choice.label.toLowerCase());
            return label.includes("echou");
          });
        }
      }
      setValidChoice(matchedChoice || null);
      return;
    }

    // Test de hasard classique
    if (chapterData.choices && Array.isArray(chapterData.choices)) {
      const matchedChoice = chapterData.choices.find((choice) => {
        const numbers = choice.label.match(/\d+/g)?.map(Number);
        return numbers?.includes(total);
      });
      setValidChoice(matchedChoice || null);
    }
  };

  // --- DEBUG: Affiche chapterData en console ---
  console.log("chapterData", chapterData);

  return (
    <div
      className={`chapter chapter-${id}`}
      role="region"
      aria-label="Chapitre interactif"
    >
      {/* Notifications de modification de stats */}
      <StatChangeNotification notifications={notifications} />

      {/* Modale fiche personnage */}
      <Modal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        {characterData ? (
          <CharacterSheet data={characterData} />
        ) : (
          <p>Chargement de la fiche personnage...</p>
        )}
      </Modal>

      {loading && <p className="loading-message">Chargement du chapitre...</p>}
      {error && <div className="error-message">Erreur : {error}</div>}

      {!loading && !error && chapterData && (
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
            {/* Bouton fiche personnage juste sous l'image */}
            <CharacterSheetButton onClick={() => setIsSheetOpen(true)} />
          </div>

          <section
            className={`chapter-text ${id === "0" ? "first-chapter" : ""}`}
          >
            {renderFormattedText(getPersonalizedText(chapterData.text))}
          </section>

          {/* Apparition des ennemis lors d’un combat */}
          {chapterData.combat?.ennemis && (
            <CombatEnnemis ennemis={chapterData.combat.ennemis} />
          )}

          {/* Section du test de chance, d'habileté ou de hasard (si requis) */}
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
              <DiceRoll
                numberOfDice={chapterData.diceRoll.numberOfDice || 2}
                onResult={handleDiceResult}
              />
              {diceTotal !== null && (
                <p className="dice-result">Résultat du lancer : {diceTotal}</p>
              )}
            </section>
          )}

          {/* Section des choix du joueur */}
          {Array.isArray(chapterData.choices) &&
            chapterData.choices.length > 0 && (
              <nav className="chapter-choices" aria-label="Choix disponibles">
                {chapterData.diceRoll?.required ? (
                  diceTotal !== null ? (
                    validChoice ? (
                      <button
                        className="chapter-choice"
                        onClick={() => handleChoiceClick(validChoice.next)}
                      >
                        {validChoice.label}
                      </button>
                    ) : (
                      <p>Aucun choix disponible pour ce résultat.</p>
                    )
                  ) : (
                    <p>Veuillez lancer les dés pour voir vos choix.</p>
                  )
                ) : (
                  chapterData.choices.map((choice, index) => (
                    <button
                      key={index}
                      className="chapter-choice"
                      onClick={() => handleChoiceClick(choice.next)}
                    >
                      {choice.label}
                    </button>
                  ))
                )}
              </nav>
            )}
        </article>
      )}
    </div>
  );
};

export default Chapter;
