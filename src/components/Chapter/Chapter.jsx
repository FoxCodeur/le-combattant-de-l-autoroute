import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// === Imports utilitaires & contextes ===
import renderFormattedText from "../../utils/renderFormattedText"; // Formattage du texte du chapitre (gras, italique, etc.)
import ChapterContext from "../../context/ChapterContext"; // Fournit les données du chapitre et du personnage
import StatNotificationContext from "../../context/StatNotificationContext"; // Pour afficher les notifications de changement de stats
import applyNarrativeModifiers from "../../utils/applyNarrativeModifiers"; // Applique les modificateurs narratifs des chapitres

// === Imports composants UI ===
import DiceRoll from "../DiceRoll/DiceRoll"; // Composant pour lancer les dés
import CharacterSheetButton from "../CharacterSheetButton/CharacterSheetButton"; // Affiche le bouton pour la fiche perso
import Modal from "../Modal/Modal"; // Fenêtre modale générique
import CharacterSheet from "../CharacterSheet/CharacterSheet"; // Affiche la fiche de personnage
import StatChangeNotification from "../StatChangeNotification/StatChangeNotification"; // Affiche les notifications de stats
import CombatEnnemis from "../CombatEnnemis/CombatEnnemis"; // Affiche les informations sur le(s) ennemi(s) du combat

import "./Chapter.scss";
import defaultPicture from "../../assets/images/defaultPicture.webp";

const Chapter = () => {
  // ==== Récupération de l'ID de chapitre via l'URL et navigation ====
  const { id } = useParams();
  const navigate = useNavigate();

  // ==== Récupération des données et méthodes du contexte du chapitre ====
  const {
    chapterData,
    fetchChapter,
    loading,
    error,
    characterData,
    setCharacterData,
  } = useContext(ChapterContext);

  // ==== Etats locaux ====
  const [diceTotal, setDiceTotal] = useState(null); // Résultat du dernier lancer de dés
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Contrôle de l'ouverture de la fiche personnage
  const [hasRolled, setHasRolled] = useState(false); // Indique si le joueur a lancé les dés

  // ==== Récupération du contexte de notification des changements de stats ====
  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  // === useEffect pour charger les données du chapitre à chaque changement d'id ===
  useEffect(() => {
    fetchChapter(id); // Charge le chapitre demandé
    setDiceTotal(null); // Réinitialise le résultat du dé
    setHasRolled(false); // Réinitialise le statut du lancer de dé
  }, [id, fetchChapter]);

  // === useEffect pour appliquer les modificateurs narratifs du chapitre (bonus/malus automatiques) ===
  useEffect(() => {
    if (
      chapterData &&
      chapterData.modificateursNarratifs &&
      typeof chapterData.modificateursNarratifs === "object" &&
      Object.keys(chapterData.modificateursNarratifs).length > 0 &&
      characterData &&
      setCharacterData
    ) {
      // Clone du personnage pour éviter les mutations directes
      const safeCharacter = { ...characterData };
      // Crée la liste des chapitres déjà modifiés (évite de réappliquer les modifs)
      if (!Array.isArray(safeCharacter.chapitresModifies)) {
        safeCharacter.chapitresModifies = [];
      }
      const chapterId = String(chapterData.id ?? id);
      // Applique les modificateurs seulement si ce chapitre ne l'a jamais fait
      if (!safeCharacter.chapitresModifies.includes(chapterId)) {
        const { character: updated, changes } = applyNarrativeModifiers(
          chapterData.modificateursNarratifs,
          safeCharacter
        );
        // Ajoute l'ID du chapitre à la liste
        updated.chapitresModifies = [
          ...safeCharacter.chapitresModifies,
          chapterId,
        ];
        setCharacterData(updated); // Met à jour le personnage avec les nouvelles stats
        if (changes && changes.length > 0) {
          addNotifications(changes); // Affiche les notifications pour chaque changement
        }
      }
    }
  }, [chapterData, characterData, setCharacterData, id, addNotifications]);

  // === Callback utilisé quand un lancer de dés est effectué ===
  const handleDiceResult = (total) => {
    setDiceTotal(total); // Mémorise le résultat
    setHasRolled(true); // Indique que les dés ont été lancés

    // Si le chapitre impose un effet direct sur une stat en fonction du résultat du dé
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

      // Applique le résultat du dé sur la stat appropriée
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

      // Icônes et labels pour la notification de stat
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

      // Affiche la notification correspondante
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

      // (Optionnel) Ici on pourrait gérer une conséquence si la stat tombe à zéro
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
    return;
  };

  // === Utilitaire pour normaliser une chaîne (pratique pour les comparaisons sans accent) ===
  const normalize = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // === Remplace {hero} dans le texte par le nom du personnage ===
  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

  // === Callback quand l'utilisateur clique sur un choix ===
  const handleChoiceClick = (choice) => {
    // Applique les éventuels modificateurs du choix
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
    // Navigue vers le chapitre suivant (next)
    navigate(`/chapitre/${choice.next}`);
  };

  // === Génère dynamiquement les boutons de choix à la fin du chapitre ===
  const renderChoices = () => {
    // Si le chapitre impose un test de chance
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

    // Si le chapitre impose un test d'habileté
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

    // Sinon : affiche tous les choix disponibles
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
      {/* Affichage des notifications de changement de stats */}
      <StatChangeNotification notifications={notifications} />

      {/* Modale pour la fiche personnage */}
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

      {/* Affichage du chapitre si les données sont bien chargées */}
      {!loading && !error && chapterData && chapterData.title ? (
        <article className="chapter-content">
          {/* Titre du chapitre */}
          <h1 className="chapter-title">
            {chapterData.title || "Titre manquant"}
          </h1>

          {/* Illustration du chapitre + accès fiche personnage */}
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

          {/* Affichage du bloc combat si besoin */}
          {chapterData.combat?.ennemis && (
            <CombatEnnemis
              ennemis={chapterData.combat.ennemis}
              type={chapterData.combat.type}
            />
          )}

          {/* Bloc test de dés */}
          {chapterData.diceRoll?.required && (
            <section className="chapter-dice-test">
              {/* Description du test si présente */}
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
              {/* Composant DiceRoll si pas encore lancé */}
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

          {/* Bloc de choix (boutons) */}
          {Array.isArray(chapterData.choices) &&
            chapterData.choices.length > 0 && (
              <nav className="chapter-choices" aria-label="Choix disponibles">
                {renderChoices()}
              </nav>
            )}
        </article>
      ) : (
        // Message d'erreur si pas de données
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
