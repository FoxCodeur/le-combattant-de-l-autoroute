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
  const [hasRolled, setHasRolled] = useState(false);

  // Notifications via context
  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  useEffect(() => {
    fetchChapter(id);
    setDiceTotal(null);
    setValidChoice(null);
    setHasRolled(false);
  }, [id, fetchChapter]);

  // Applique les modificateurs narratifs une seule fois par chapitre et affiche les notifications
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
  }, [chapterData, characterData, setCharacterData, id, addNotifications]);

  // Gère le résultat du lancer de dés et applique diceRoll si présent
  const handleDiceResult = (total) => {
    setDiceTotal(total);
    setHasRolled(true);

    if (
      chapterData.diceRoll?.required &&
      characterData &&
      chapterData.diceRoll.applyTo
    ) {
      let updatedCharacter = {
        ...characterData,
        caractéristiques: characterData.caractéristiques
          ? { ...characterData.caractéristiques }
          : undefined,
        interceptor: characterData.interceptor
          ? { ...characterData.interceptor }
          : undefined,
      };

      const stat = chapterData.diceRoll.applyTo.stat;
      const operation = chapterData.diceRoll.applyTo.operation;

      if (stat in updatedCharacter) {
        if (operation === "add") updatedCharacter[stat] += total;
        if (operation === "subtract") updatedCharacter[stat] -= total;
        if (updatedCharacter[stat] < 0) updatedCharacter[stat] = 0;
      } else if (
        updatedCharacter.caractéristiques &&
        stat in updatedCharacter.caractéristiques
      ) {
        if (operation === "add")
          updatedCharacter.caractéristiques[stat] += total;
        if (operation === "subtract")
          updatedCharacter.caractéristiques[stat] -= total;
        if (updatedCharacter.caractéristiques[stat] < 0)
          updatedCharacter.caractéristiques[stat] = 0;
      } else if (
        updatedCharacter.interceptor &&
        stat in updatedCharacter.interceptor
      ) {
        if (operation === "add") updatedCharacter.interceptor[stat] += total;
        if (operation === "subtract")
          updatedCharacter.interceptor[stat] -= total;
        if (updatedCharacter.interceptor[stat] < 0)
          updatedCharacter.interceptor[stat] = 0;
      }

      const statIcons = {
        endurance: "/images/icons/endurance.png",
        habilete: "/images/icons/habilete.png",
        chance: "/images/icons/chance.png",
        blindage: "/images/icons/blindage.png",
      };
      const statLabels = {
        endurance: "Endurance",
        habilete: "HABILETÉ",
        chance: "Chance",
        blindage: "Blindage",
      };

      addNotifications([
        {
          stat,
          type: operation === "subtract" ? "loss" : "gain",
          value: total,
          icon: statIcons[stat] || "",
          label: statLabels[stat] || stat,
        },
      ]);

      setCharacterData(updatedCharacter);

      const currentValue =
        (stat in updatedCharacter && updatedCharacter[stat]) ||
        (updatedCharacter.caractéristiques &&
          updatedCharacter.caractéristiques[stat]) ||
        (updatedCharacter.interceptor && updatedCharacter.interceptor[stat]);
      if (currentValue <= 0) {
        setValidChoice(null);
        return;
      }
      setValidChoice(null);
      return;
    }

    // Test Habileté
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

    // Test Chance
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

    // Si test via labels numériques
    if (chapterData.choices && Array.isArray(chapterData.choices)) {
      const matchedChoice = chapterData.choices.find((choice) => {
        const numbers = choice.label.match(/\d+/g)?.map(Number);
        return numbers?.includes(total);
      });
      setValidChoice(matchedChoice || null);
    }
  };

  const normalize = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

  const getCurrentStat = (stat) => {
    if (!characterData) return 1;
    if (stat in characterData) return characterData[stat];
    if (
      characterData.caractéristiques &&
      stat in characterData.caractéristiques
    )
      return characterData.caractéristiques[stat];
    if (characterData.interceptor && stat in characterData.interceptor)
      return characterData.interceptor[stat];
    return 1;
  };

  const statToWatch = chapterData?.diceRoll?.applyTo?.stat || "endurance";

  // ----------- GESTION DES CHOIX AVEC MODIFS -------------
  const handleChoiceClick = (choice) => {
    // Appliquer les modificateurs narratifs du choix, s'il y en a
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

  // ----------- AFFICHAGE DES CHOIX SELON TEST CHANCE/HABILETE -------------
  const renderChoices = () => {
    // Test Chance
    if (chapterData.diceRoll?.required && chapterData.testChance?.required) {
      if (diceTotal === null) {
        return <p>Veuillez lancer les dés pour continuer.</p>;
      } else {
        const chance = characterData?.caractéristiques?.chance ?? 0;
        if (diceTotal <= chance) {
          // Test réussi
          const successChoice = chapterData.choices.find((c) =>
            normalize(c.label.toLowerCase()).includes("reuss")
          );
          return successChoice ? (
            <button
              className="chapter-choice"
              onClick={() => handleChoiceClick(successChoice)}
            >
              {successChoice.label}
            </button>
          ) : null;
        } else {
          // Test échoué
          const failChoice = chapterData.choices.find((c) =>
            normalize(c.label.toLowerCase()).includes("echou")
          );
          return failChoice ? (
            <button
              className="chapter-choice"
              onClick={() => handleChoiceClick(failChoice)}
            >
              {failChoice.label}
            </button>
          ) : null;
        }
      }
    }

    // Test Habileté (similaire)
    if (chapterData.diceRoll?.required && chapterData.testHabilete?.required) {
      if (diceTotal === null) {
        return <p>Veuillez lancer les dés pour continuer.</p>;
      } else {
        const habilete = characterData?.caractéristiques?.habilete ?? 0;
        if (diceTotal <= habilete) {
          // Test réussi
          const successChoice = chapterData.choices.find((c) =>
            normalize(c.label.toLowerCase()).includes("reuss")
          );
          return successChoice ? (
            <button
              className="chapter-choice"
              onClick={() => handleChoiceClick(successChoice)}
            >
              {successChoice.label}
            </button>
          ) : null;
        } else {
          // Test échoué
          const failChoice = chapterData.choices.find((c) =>
            normalize(c.label.toLowerCase()).includes("echou")
          );
          return failChoice ? (
            <button
              className="chapter-choice"
              onClick={() => handleChoiceClick(failChoice)}
            >
              {failChoice.label}
            </button>
          ) : null;
        }
      }
    }

    // Pas de test de réussite/échec : afficher tous les choix
    return chapterData.choices.map((choice, index) => (
      <button
        key={index}
        className="chapter-choice"
        onClick={() => handleChoiceClick(choice)}
      >
        {choice.label}
      </button>
    ));
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
            <CombatEnnemis ennemis={chapterData.combat.ennemis} />
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
              {!hasRolled && (
                <DiceRoll
                  numberOfDice={chapterData.diceRoll.numberOfDice || 2}
                  onResult={handleDiceResult}
                />
              )}
              {diceTotal !== null && (
                <p className="dice-result">Résultat du lancer : {diceTotal}</p>
              )}
            </section>
          )}

          {Array.isArray(chapterData.choices) &&
            chapterData.choices.length > 0 && (
              <nav className="chapter-choices" aria-label="Choix disponibles">
                {renderChoices()}
              </nav>
            )}
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
