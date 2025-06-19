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
 * Composant principal d'un chapitre du livre-jeu.
 *
 * Gère :
 * - L'affichage du texte, de l'image et des choix du chapitre
 * - Les tests de dés (endurance, habileté, chance, etc.)
 * - L'application des modificateurs narratifs/statistiques
 * - Les interactions utilisateur (choix, fiche personnage...)
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

  // État du résultat du lancer de dé
  const [diceTotal, setDiceTotal] = useState(null);
  // État de la modale de fiche perso
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Savoir si l'utilisateur a lancé le dé (pour afficher/comportement du DiceRoll)
  const [hasRolled, setHasRolled] = useState(false);

  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  // À chaque changement d'id de chapitre, on recharge les données et on reset les états liés au dé
  useEffect(() => {
    fetchChapter(id);
    setDiceTotal(null); // reset le résultat du dé
    setHasRolled(false); // reset l'état du lancer
  }, [id, fetchChapter]);

  // Application one-shot des modificateurs narratifs/statistiques éventuels à l'arrivée sur ce chapitre
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
      }
    }
  }, [chapterData, characterData, setCharacterData, id, addNotifications]);

  /**
   * Callback appelé après le lancer de dé (DiceRoll) :
   * - Met à jour le résultat du dé (diceTotal)
   * - Applique la perte/gain de stat si besoin
   * - Déclenche un affichage de notification
   */
  const handleDiceResult = (total) => {
    setDiceTotal(total);
    setHasRolled(true);

    // Applique la stat concernée si besoin (ex : perte d'endurance, blindage, etc.)
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

  // Callback au clic sur un bouton de choix (narratif ou navigation)
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

  /**
   * Fonction utilitaire pour filtrer les choix selon la condition (inventaire ou autre)
   * Cette version considère d'abord characterData.inventaire s'il existe,
   * sinon characterData.équipement (tous objets avec une valeur > 0).
   * Elle tolère les différences d'underscore et de casse.
   */
  const isChoiceAvailable = (choice) => {
    if (!choice.condition) return true;
    if (choice.condition.item) {
      const normalize = (str) => str.replace(/_/g, "").toLowerCase();
      let items = [];
      // Cherche dans 'inventaire' si présent (tableau), sinon dans 'équipement' (objet)
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
    // Autres types de conditions possibles ici...
    return true;
  };

  /**
   * Affichage des boutons de choix selon le mode du chapitre :
   * - Prend en compte les conditions sur l'inventaire (filtrage en amont)
   */
  const renderChoices = () => {
    if (!chapterData || !Array.isArray(chapterData.choices)) return null;

    // On filtre d'abord tous les choix selon l'inventaire/condition
    const filteredChoices = chapterData.choices.filter(isChoiceAvailable);

    // --- CAS 1 : Test de chance
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

    // --- CAS 1 bis : Test d'habileté
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

    // --- CAS 2 : dé requis, plusieurs choix, SANS mapping chiffre/label (aucun label ne contient de nombre)
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

    // --- CAS 3 : dé requis, plusieurs choix AVEC mapping résultat/label (labels contiennent des chiffres)
    if (
      chapterData.diceRoll?.required &&
      !chapterData.testChance?.required &&
      !chapterData.testHabilete?.required &&
      filteredChoices.length > 1 &&
      filteredChoices.some((choice) => /\d/.test(choice.label))
    ) {
      if (diceTotal === null) {
        // Affiche tous les boutons désactivés pour montrer les labels, même avant le lancer de dé
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
      // Affiche tous les boutons, seul le bon est activé
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

    // --- CAS 4 : dé requis, un seul bouton ("Next..."), ex : chapitre 342
    if (
      chapterData.diceRoll?.required &&
      !chapterData.testChance?.required &&
      !chapterData.testHabilete?.required &&
      filteredChoices.length === 1
    ) {
      // Correction anti-bug : le bouton reste activé tant que le dé a été lancé,
      // même si un re-render intervient (grâce à diceTotal qui n'est pas remis à null hors changement de chapitre)
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

    // --- CAS 5 : pas de test de dés, tous les choix affichés normalement (filtrés)
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
