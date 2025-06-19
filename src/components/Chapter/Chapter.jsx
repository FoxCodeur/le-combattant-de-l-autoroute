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
import "./Chapter.scss";
import defaultPicture from "../../assets/images/defaultPicture.webp";

/**
 * Composant principal d'un chapitre, gère l'affichage du texte, des choix, des dés, etc.
 */
const Chapter = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Contexts apportant les données du chapitre, personnage, notifications, etc.
  const {
    chapterData,
    fetchChapter,
    loading,
    error,
    characterData,
    setCharacterData,
  } = useContext(ChapterContext);

  const [diceTotal, setDiceTotal] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);

  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  // Recharge le chapitre à chaque changement d'id
  useEffect(() => {
    fetchChapter(id);
    setDiceTotal(null);
    setHasRolled(false);
  }, [id, fetchChapter]);

  // Applique les modificateurs narratifs si besoin (one-shot par chapitre)
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

  /**
   * Callback après le lancer de dé, applique éventuellement la perte/gain de stat
   */
  const handleDiceResult = (total) => {
    setDiceTotal(total);
    setHasRolled(true);

    // Si le chapitre demande de modifier une stat après le dé (ex : BLINDAGE...)
    if (
      chapterData?.diceRoll?.required &&
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

      // Notifications pour l'utilisateur
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
    }
  };

  // Utilitaire pour normaliser les accents
  const normalize = (str) =>
    str && typeof str === "string"
      ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : "";

  // Personnalise le texte du chapitre avec le nom du héros
  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

  // Gestion du clic sur un choix (narratif ou simple navigation)
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

  // Fonction utilitaire pour filtrer les choix selon la condition (inventaire ou autre)
  const isChoiceAvailable = (choice) => {
    if (!choice.condition) return true;
    // Condition sur un item
    if (choice.condition.item) {
      const items = characterData?.inventaire || [];
      const hasItem = items.includes(choice.condition.item);
      return choice.condition.hasItem ? hasItem : !hasItem;
    }
    // Autres types de conditions possibles ici...
    return true;
  };

  /**
   * Affichage des boutons de choix selon le mode du chapitre :
   * - Test de chance/habilete : bouton unique selon résultat
   * - Hasard pur à choix multiples (ex : "si vous obtenez 1,2,3..." ou "4,5,6...") : n'affiche que le bouton correspondant au résultat
   * - Stat à déduire ou Next... : tous les boutons affichés mais désactivés avant le dé
   * - Pas de dé : tous les boutons visibles (filtrés par condition)
   */
  const renderChoices = () => {
    if (!chapterData || !Array.isArray(chapterData.choices)) return null;

    // On filtre les choix selon la condition (inventaire, etc)
    const filteredChoices = chapterData.choices.filter(isChoiceAvailable);

    // --- Test de chance
    if (chapterData.diceRoll?.required && chapterData.testChance?.required) {
      if (diceTotal === null) {
        return <p>Veuillez lancer les dés pour continuer.</p>;
      }
      const chance = characterData?.caractéristiques?.chance ?? 0;
      if (diceTotal <= chance) {
        const successChoice = filteredChoices.find((c) =>
          normalize(c.label?.toLowerCase()).includes("reuss")
        );
        return successChoice ? (
          <button
            className="chapter-choice"
            onClick={() => handleChoiceClick(successChoice)}
          >
            {successChoice.label}
          </button>
        ) : null;
      }
      const failChoice = filteredChoices.find((c) =>
        normalize(c.label?.toLowerCase()).includes("echou")
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

    // --- Test d'habileté
    if (chapterData.diceRoll?.required && chapterData.testHabilete?.required) {
      if (diceTotal === null) {
        return <p>Veuillez lancer les dés pour continuer.</p>;
      }
      const habilete = characterData?.caractéristiques?.habilete ?? 0;
      if (diceTotal <= habilete) {
        const successChoice = filteredChoices.find((c) =>
          normalize(c.label?.toLowerCase()).includes("reuss")
        );
        return successChoice ? (
          <button
            className="chapter-choice"
            onClick={() => handleChoiceClick(successChoice)}
          >
            {successChoice.label}
          </button>
        ) : null;
      }
      const failChoice = filteredChoices.find((c) =>
        normalize(c.label?.toLowerCase()).includes("echou")
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

    // --- Hasard pur à choix multiples (ex : "si vous obtenez 1,2,3..." OU "si vous obtenez 4,5,6...")
    if (
      chapterData.diceRoll?.required &&
      !chapterData.testChance?.required &&
      !chapterData.testHabilete?.required &&
      filteredChoices.length > 1
    ) {
      if (diceTotal === null) {
        return <p>Veuillez lancer le dé pour continuer.</p>;
      }
      const matchingChoice = filteredChoices.find((choice) => {
        // Extrait tous les nombres du label (ex: "Si vous obtenez 1, 2 ou 3..." => [1,2,3])
        const numbers = choice.label.match(/\d+/g)?.map(Number) || [];
        return numbers.includes(diceTotal);
      });
      return matchingChoice ? (
        <button
          className="chapter-choice"
          onClick={() => handleChoiceClick(matchingChoice)}
        >
          {matchingChoice.label}
        </button>
      ) : (
        <p>Aucun choix ne correspond au résultat du dé ({diceTotal}).</p>
      );
    }

    // --- Hasard pur/stat à déduire avec un seul bouton ("Next..."), ou Next après stat à déduire
    if (
      chapterData.diceRoll?.required &&
      !chapterData.testChance?.required &&
      !chapterData.testHabilete?.required &&
      filteredChoices.length === 1
    ) {
      return filteredChoices.map((choice, idx) => (
        <button
          key={idx}
          className="chapter-choice"
          onClick={() => diceTotal !== null && handleChoiceClick(choice)}
          disabled={diceTotal === null}
        >
          {choice.label}
        </button>
      ));
    }

    // --- Cas sans test de dés : tous les choix sont affichés normalement (filtrés)
    return filteredChoices.map((choice, index) => (
      <button
        key={index}
        className="chapter-choice"
        onClick={() => handleChoiceClick(choice)}
      >
        {choice.label}
      </button>
    ));
  };

  // --- Rendu principal du composant ---
  return (
    <div
      className={`chapter chapter-${id}`}
      role="region"
      aria-label="Chapitre interactif"
    >
      {/* Notifications/statistiques */}
      <StatChangeNotification notifications={notifications} />

      {/* Modale fiche personnage */}
      <Modal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        {characterData ? (
          <CharacterSheet data={characterData} />
        ) : (
          <p>Chargement de la fiche personnage...</p>
        )}
      </Modal>

      {/* Loading et erreurs */}
      {loading && <p className="loading-message">Chargement du chapitre...</p>}
      {error && <div className="error-message">Erreur : {error}</div>}

      {/* Corps du chapitre */}
      {!loading && !error && chapterData && chapterData.title ? (
        <article className="chapter-content">
          <h1 className="chapter-title">
            {chapterData.title || "Titre manquant"}
          </h1>

          {/* Illustration */}
          <div className="chapter-image-container">
            <img
              src={chapterData.image ? chapterData.image : defaultPicture}
              alt={`Illustration du chapitre : ${chapterData.title}`}
              className="chapter-image"
              onError={(e) => {
                e.target.src = defaultPicture;
              }}
            />
            {/* Accès fiche personnage */}
            <CharacterSheetButton onClick={() => setIsSheetOpen(true)} />
          </div>

          {/* Texte principal */}
          <section
            className={`chapter-text ${id === "0" ? "first-chapter" : ""}`}
          >
            {renderFormattedText(getPersonalizedText(chapterData.text))}
          </section>

          {/* Bloc combat si besoin */}
          {chapterData.combat?.ennemis && (
            <CombatEnnemis
              ennemis={chapterData.combat.ennemis}
              type={chapterData.combat.type}
            />
          )}

          {/* Bloc test de dés */}
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
              {/* Lancer de dé */}
              {!hasRolled && (
                <DiceRoll
                  numberOfDice={chapterData.diceRoll.numberOfDice || 2}
                  onResult={handleDiceResult}
                />
              )}
              {/* Affichage du résultat */}
              {diceTotal !== null && (
                <p className="dice-result">Résultat du lancer : {diceTotal}</p>
              )}
            </section>
          )}

          {/* Boutons de choix */}
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
