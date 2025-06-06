import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// === Utils et contextes ===
import renderFormattedText from "../../utils/renderFormattedText"; // Utilisé pour afficher le texte du chapitre avec formatage
import ChapterContext from "../../context/ChapterContext"; // Contexte global du chapitre (données, chargement...)
import StatNotificationContext from "../../context/StatNotificationContext"; // Pour gérer les notifications de changements de stats
import applyNarrativeModifiers from "../../utils/applyNarrativeModifiers"; // Fonction utilitaire pour appliquer des modificateurs narratifs

// === Composants UI ===
import DiceRoll from "../DiceRoll/DiceRoll"; // Composant pour lancer les dés
import CharacterSheetButton from "../CharacterSheetButton/CharacterSheetButton"; // Bouton pour ouvrir la fiche personnage
import Modal from "../Modal/Modal"; // Modale pour afficher des contenus (ici la fiche personnage)
import CharacterSheet from "../CharacterSheet/CharacterSheet"; // Composant fiche personnage
import StatChangeNotification from "../StatChangeNotification/StatChangeNotification"; // Affiche des notifications lors des changements de stats
import CombatEnnemis from "../CombatEnnemis/CombatEnnemis"; // Affiche la section combat si besoin

import "./Chapter.scss"; // Styles du composant
import defaultPicture from "../../assets/images/defaultPicture.webp"; // Image de secours pour le chapitre

/**
 * Composant principal d'un chapitre.
 * Gère l'affichage du texte, les choix, les tests de dés, la fiche personnage et l'application des modificateurs narratifs.
 * Interagit avec :
 *   - ChapterContext (données du chapitre et du personnage)
 *   - StatNotificationContext (pour afficher les notifications de changements de stats)
 *   - applyNarrativeModifiers (pour appliquer les effets des choix et chapitres)
 *   - DiceRoll, CharacterSheet, CombatEnnemis (UI)
 */
const Chapter = () => {
  // Récupère l'id du chapitre depuis l'URL et la fonction de navigation
  const { id } = useParams();
  const navigate = useNavigate();

  // Récupère les infos du contexte chapitre (provenant de ChapterContext)
  const {
    chapterData, // Données du chapitre courant
    fetchChapter, // Fonction pour charger un chapitre
    loading, // Booléen : le chapitre est-il en cours de chargement ?
    error, // Message d'erreur s'il y a eu un problème
    characterData, // Données du personnage courant
    setCharacterData, // Fonction pour mettre à jour le personnage
  } = useContext(ChapterContext);

  // États locaux du composant
  const [diceTotal, setDiceTotal] = useState(null); // Résultat du lancer de dés (s'il y en a un)
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Fiche personnage ouverte ?
  const [hasRolled, setHasRolled] = useState(false); // Un lancer de dés a-t-il eu lieu ?

  // Notifications pour les changements de stats (via StatNotificationContext)
  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  // === Effet : chargement du chapitre à chaque changement d'id (URL) ===
  useEffect(() => {
    fetchChapter(id); // Récupère les données du chapitre courant
    setDiceTotal(null); // Réinitialise le résultat des dés
    setHasRolled(false); // Réinitialise le flag de lancer de dés
  }, [id, fetchChapter]);

  // === Effet : applique les modificateurs narratifs automatiques du chapitre (si présents, et jamais appliqués) ===
  useEffect(() => {
    if (
      chapterData &&
      chapterData.modificateursNarratifs &&
      typeof chapterData.modificateursNarratifs === "object" &&
      Object.keys(chapterData.modificateursNarratifs).length > 0 &&
      characterData &&
      setCharacterData
    ) {
      // Clone léger pour éviter les effets de bord
      const safeCharacter = { ...characterData };
      // Ajoute un tableau pour pister les chapitres déjà "modifiés"
      if (!Array.isArray(safeCharacter.chapitresModifies)) {
        safeCharacter.chapitresModifies = [];
      }
      const chapterId = String(chapterData.id ?? id);
      // Vérifie si ce chapitre a déjà appliqué ses modifs narratives
      if (!safeCharacter.chapitresModifies.includes(chapterId)) {
        // Applique les modificateurs narratifs (fonction utilitaire)
        const { character: updated, changes } = applyNarrativeModifiers(
          chapterData.modificateursNarratifs,
          safeCharacter
        );
        // Met à jour la liste des chapitres "modifiés"
        updated.chapitresModifies = [
          ...safeCharacter.chapitresModifies,
          chapterId,
        ];
        setCharacterData(updated); // Met à jour le personnage (via contexte)

        // Affiche les notifications de changement de stats si besoin
        if (changes && changes.length > 0) {
          addNotifications(changes);
        }
      }
    }
  }, [chapterData, characterData, setCharacterData, id, addNotifications]);

  /**
   * Gère le résultat d'un lancer de dés (DiceRoll)
   * Peut appliquer un effet sur une caractéristique du personnage selon le chapitre
   * Peut aussi servir à déterminer le choix "réussi/échoué" à afficher selon le test
   */
  const handleDiceResult = (total) => {
    setDiceTotal(total);
    setHasRolled(true);

    // Application directe d'un résultat de dé sur une caractéristique (ex: perte/gain d'endurance)
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

      // Applique sur le bon niveau d'objet (racine, caractéristiques, interceptor)
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

      // Affiche une notification de changement de stat
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

      // Si la stat tombe à zéro ou moins : on pourrait gérer ici une conséquence (ex : game over)
      const currentValue =
        (stat in updatedCharacter && updatedCharacter[stat]) ||
        (updatedCharacter.caractéristiques &&
          updatedCharacter.caractéristiques[stat]) ||
        (updatedCharacter.interceptor && updatedCharacter.interceptor[stat]);
      if (currentValue <= 0) {
        return;
      }
      return;
    }

    // Pour les tests spéciaux (habileté, chance), la logique de choix s'opère dans renderChoices (pas ici)
    // Ici, on ne fait rien de plus
    return;
  };

  /**
   * Normalise une chaîne (supprime les accents) pour faciliter la recherche de mots-clés dans les labels des choix
   */
  const normalize = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  /**
   * Personnalise le texte du chapitre avec le nom du héros si besoin
   */
  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

  /**
   * Gère le clic sur un choix (bouton)
   * Applique les éventuels modificateurs narratifs liés au choix
   * Met à jour le personnage et affiche les notifications si besoin
   * Navigue ensuite vers le chapitre suivant
   * Interagit avec : applyNarrativeModifiers, setCharacterData, addNotifications, navigate
   */
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
   * Affiche les choix possibles à la fin du chapitre :
   * - Si test de chance/habileté : n'affiche qu'un seul bouton selon le résultat du dé
   * - Sinon : affiche tous les choix
   * Interagit avec : handleChoiceClick
   */
  const renderChoices = () => {
    // Test Chance
    if (chapterData.diceRoll?.required && chapterData.testChance?.required) {
      if (diceTotal === null) {
        return <p>Veuillez lancer les dés pour continuer.</p>;
      } else {
        const chance = characterData?.caractéristiques?.chance ?? 0;
        if (diceTotal <= chance) {
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

    // Sinon : tous les choix disponibles sont affichés
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

  // === Rendu principal du composant ===
  return (
    <div
      className={`chapter chapter-${id}`}
      role="region"
      aria-label="Chapitre interactif"
    >
      {/* Affiche les notifications de changement de stats */}
      <StatChangeNotification notifications={notifications} />

      {/* Modale fiche personnage */}
      <Modal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        {characterData ? (
          <CharacterSheet data={characterData} />
        ) : (
          <p>Chargement de la fiche personnage...</p>
        )}
      </Modal>

      {/* Gestion du chargement et de l'erreur */}
      {loading && <p className="loading-message">Chargement du chapitre...</p>}
      {error && <div className="error-message">Erreur : {error}</div>}

      {/* Affichage du chapitre si tout est ok */}
      {!loading && !error && chapterData && chapterData.title ? (
        <article className="chapter-content">
          <h1 className="chapter-title">
            {chapterData.title || "Titre manquant"}
          </h1>

          {/* Illustration + bouton fiche personnage */}
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

          {/* Texte du chapitre */}
          <section
            className={`chapter-text ${id === "0" ? "first-chapter" : ""}`}
          >
            {renderFormattedText(getPersonalizedText(chapterData.text))}
          </section>

          {/* Section combat si besoin */}
          {chapterData.combat?.ennemis && (
            <CombatEnnemis ennemis={chapterData.combat.ennemis} />
          )}

          {/* Section test de dés si besoin */}
          {chapterData.diceRoll?.required && (
            <section className="chapter-dice-test">
              {/* Description test habileté/chance */}
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
              {/* Affiche le composant DiceRoll si les dés n'ont pas déjà été lancés */}
              {!hasRolled && (
                <DiceRoll
                  numberOfDice={chapterData.diceRoll.numberOfDice || 2}
                  onResult={handleDiceResult}
                />
              )}
              {/* Résultat du lancer de dés affiché après coup */}
              {diceTotal !== null && (
                <p className="dice-result">Résultat du lancer : {diceTotal}</p>
              )}
            </section>
          )}

          {/* Choix disponibles à la fin du chapitre */}
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
