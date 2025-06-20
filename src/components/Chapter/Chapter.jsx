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
import GameOverModal from "../GameOverModal/GameOverModal";
import "./Chapter.scss";
import defaultPicture from "../../assets/images/defaultPicture.webp";

/**
 * Composant principal d'un chapitre du livre-jeu.
 *
 * Le Game Over ne s'affiche plus à l'arrivée sur le chapitre, mais uniquement au clic sur un choix
 * si les stats sont tombées à zéro ou moins (après application des modificateurs).
 */
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  // Reset de l'état à chaque changement de chapitre
  useEffect(() => {
    fetchChapter(id);
    setDiceTotal(null);
    setHasRolled(false);
    setIsGameOver(false);
  }, [id, fetchChapter]);

  /**
   * Fonction utilitaire qui détermine si le Game Over doit être déclenché.
   * Elle vérifie si blindage OU endurance sont tombés à 0 ou moins.
   */
  const mustTriggerGameOver = (character) => {
    const blindage =
      character.caractéristiques?.blindage ??
      character.interceptor?.blindage ??
      character.blindage ??
      null;
    const endurance =
      character.caractéristiques?.endurance ??
      character.interceptor?.endurance ??
      character.endurance ??
      null;
    return (
      (typeof blindage === "number" && blindage <= 0) ||
      (typeof endurance === "number" && endurance <= 0)
    );
  };

  /**
   * Application one-shot des modificateurs narratifs/statistiques éventuels à l'arrivée sur ce chapitre.
   * On applique les modificateurs mais on NE déclenche PAS le Game Over ici pour laisser le temps au lecteur
   * de lire le texte. Le Game Over sera géré au clic sur un choix.
   */
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
      // On applique les mods une seule fois par chapitre
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
        // NE PAS déclencher le Game Over ici !
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterData, characterData, setCharacterData, id, addNotifications]);

  /**
   * Callback appelé après le lancer de dé (DiceRoll) :
   * - Met à jour le résultat du dé (diceTotal)
   * - Applique la perte/gain de stat si besoin
   * - Déclenche un affichage de notification
   * - Déclenche le Game Over si stat vitale à 0
   */
  const handleDiceResult = (total) => {
    setDiceTotal(total);
    setHasRolled(true);

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

      // Application de la stat (résilient à la structure du personnage)
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

      // Notifications pour l'utilisateur (affichage icône et texte)
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

      // Déclencher Game Over si stat vitale tombe à 0 ou moins
      if (mustTriggerGameOver(updatedCharacter)) {
        setIsGameOver(true);
      }
    }
  };

  // Utilitaire pour normaliser les accents
  const normalize = (str) =>
    str && typeof str === "string"
      ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : "";

  // Remplace le {hero} par le nom du personnage dans le texte du chapitre
  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

  /**
   * Callback au clic sur un bouton de choix (narratif ou navigation)
   * Applique les modificateurs narratifs s'il y en a, puis navigue si pas Game Over
   * Déclenche le Game Over si besoin après modification du personnage.
   */
  const handleChoiceClick = (choice) => {
    // On part sur le personnage courant
    let updatedCharacter = characterData;

    // Appliquer les modificateurs narratifs du CHOIX si présents
    if (choice.modificateursNarratifs) {
      const { character, changes } = applyNarrativeModifiers(
        choice.modificateursNarratifs,
        characterData
      );
      updatedCharacter = character;
      setCharacterData(character);
      if (typeof addNotifications === "function") {
        addNotifications(changes);
      }
    }

    // Vérifie si le Game Over doit être affiché APRÈS le clic (après modifs du chapitre ou du choix)
    if (mustTriggerGameOver(updatedCharacter)) {
      setIsGameOver(true);
      return; // On bloque la navigation si mort
    }

    // Navigation normale
    navigate(`/chapitre/${choice.next}`);
  };

  /**
   * Fonction utilitaire pour filtrer les choix selon la condition (inventaire ou autre)
   */
  const isChoiceAvailable = (choice) => {
    if (!choice.condition) return true;
    if (choice.condition.item) {
      const normalize = (str) => str.replace(/_/g, "").toLowerCase();
      let items = [];
      if (characterData?.inventaire) {
        items = characterData.inventaire.map(normalize);
      } else if (characterData?.équipement) {
        items = Object.entries(characterData.équipement)
          .filter(([_, v]) => v && v > 0)
          .map(([k, _]) => normalize(k));
      }
      const item = normalize(choice.condition.item);
      const hasItem = items.includes(item);
      return choice.condition.hasItem ? hasItem : !hasItem;
    }
    return true;
  };

  /**
   * Affichage des boutons de choix selon le mode du chapitre :
   */
  const renderChoices = () => {
    if (!chapterData || !Array.isArray(chapterData.choices)) return null;

    const filteredChoices = chapterData.choices.filter(isChoiceAvailable);

    // Test de chance
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

    // Test d'habileté
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

    // Dé requis, plusieurs choix, SANS mapping chiffre/label
    if (
      chapterData.diceRoll?.required &&
      !chapterData.testChance?.required &&
      !chapterData.testHabilete?.required &&
      filteredChoices.length > 1 &&
      filteredChoices.every((choice) => !/\d/.test(choice.label))
    ) {
      return filteredChoices.map((choice, index) => (
        <button
          key={index}
          className="chapter-choice"
          disabled={diceTotal === null}
          onClick={() => handleChoiceClick(choice)}
          style={
            diceTotal === null ? { opacity: 0.6, cursor: "not-allowed" } : {}
          }
        >
          {choice.label}
        </button>
      ));
    }

    // Dé requis, plusieurs choix AVEC mapping résultat/label
    if (
      chapterData.diceRoll?.required &&
      !chapterData.testChance?.required &&
      !chapterData.testHabilete?.required &&
      filteredChoices.length > 1 &&
      filteredChoices.some((choice) => /\d/.test(choice.label))
    ) {
      if (diceTotal === null) {
        return (
          <>
            {filteredChoices.map((choice, index) => (
              <button
                key={index}
                className="chapter-choice"
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              >
                {choice.label}
              </button>
            ))}
            <p>Veuillez lancer le dé pour continuer.</p>
          </>
        );
      }
      return (
        <>
          {filteredChoices.map((choice, index) => {
            const numbers = choice.label.match(/\d+/g)?.map(Number) || [];
            const isMatch = numbers.includes(diceTotal);
            return (
              <button
                key={index}
                className="chapter-choice"
                disabled={!isMatch}
                style={!isMatch ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                onClick={isMatch ? () => handleChoiceClick(choice) : undefined}
              >
                {choice.label}
              </button>
            );
          })}
        </>
      );
    }

    // Dé requis, un seul bouton ("Next...")
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
          onClick={() => handleChoiceClick(choice)}
          disabled={diceTotal === null}
          style={
            diceTotal === null ? { opacity: 0.6, cursor: "not-allowed" } : {}
          }
        >
          {choice.label}
        </button>
      ));
    }

    // Pas de test de dés, tous les choix affichés normalement
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

      {/* Bloc Game Over (affiche l'image, bloque tout le reste) */}
      <GameOverModal visible={isGameOver} />

      {/* Loading et erreurs */}
      {loading && <p className="loading-message">Chargement du chapitre...</p>}
      {error && <div className="error-message">Erreur : {error}</div>}

      {/* Corps du chapitre */}
      {!loading && !error && chapterData && chapterData.title ? (
        <article
          className="chapter-content"
          style={
            isGameOver
              ? {
                  filter: "grayscale(1) blur(2px)",
                  pointerEvents: "none",
                  userSelect: "none",
                }
              : {}
          }
        >
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

          {/* Bloc test de dés (affiché si diceRoll.required) */}
          {chapterData.diceRoll?.required && (
            <section className="chapter-dice-test">
              {/* Affichage des descriptions de test si besoin */}
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
              {/* Lancer de dé (affiché tant que le joueur ne l'a pas lancé) */}
              {!hasRolled && (
                <DiceRoll
                  numberOfDice={chapterData.diceRoll.numberOfDice || 2}
                  onResult={handleDiceResult}
                />
              )}
              {/* Affichage du résultat du lancer */}
              {diceTotal !== null && (
                <p className="dice-result">Résultat du lancer : {diceTotal}</p>
              )}
            </section>
          )}

          {/* Boutons de choix (tous les cas de figure gérés dans renderChoices) */}
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
