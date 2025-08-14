import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import renderFormattedText from "../../utils/renderFormattedText";
import ChapterContext from "../../context/ChapterContext";
import StatNotificationContext from "../../context/StatNotificationContext";
import applyNarrativeModifiers from "../../utils/applyNarrativeModifiers";
import DiceRoll from "../../components/DiceRoll/DiceRoll";
import CharacterSheetButton from "../../components/CharacterSheetButton/CharacterSheetButton";
import Modal from "../../components/Modal/Modal";
import CharacterSheet from "../../components/CharacterSheet/CharacterSheet";
import StatChangeNotification from "../../components/StatChangeNotification/StatChangeNotification";
import Combat from "../../components/Combat/Combat";
import GameOverModal from "../../components/GameOverModal/GameOverModal";
import GameRulesModal from "../../components/GameRulesModal/GameRulesModal";
import GameMapModal from "../../components/GameMapModal/GameMapModal";
import VehiculeModal from "../../components/VehiculeModal/VehiculeModal";
import ScrollToTopButton from "../../components/ScrollToTopButton/ScrollToTopButton";
import RaceGame358 from "../../components/RaceGame358/RaceGame358"; // AJOUT ICI
import "./Chapter.scss";
import defaultPicture from "../../assets/images/defaultPicture.webp";
import gameMap from "../../assets/images/map.webp";
import interceptorImage from "../../assets/images/interceptor falcon.webp";

import { GiCharacter } from "react-icons/gi";
import { FcRules } from "react-icons/fc";
import { FaMapMarkedAlt, FaCarSide } from "react-icons/fa";

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
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isVehiculeOpen, setIsVehiculeOpen] = useState(false);

  const { notifications, addNotifications } = useContext(
    StatNotificationContext
  );

  useEffect(() => {
    fetchChapter(id);
    setDiceTotal(null);
    setHasRolled(false);
    setIsGameOver(false);
  }, [id, fetchChapter]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterData, characterData, setCharacterData, id, addNotifications]);

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

      if (mustTriggerGameOver(updatedCharacter)) {
        setIsGameOver(true);
      }
    }
  };

  const normalize = (str) =>
    str && typeof str === "string"
      ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : "";

  const getPersonalizedText = (text) => {
    if (!characterData) return text;
    return text.replace(/\{hero\}/gi, characterData.nom);
  };

  const handleChoiceClick = (choice) => {
    let updatedCharacter = characterData;

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

    if (mustTriggerGameOver(updatedCharacter)) {
      setIsGameOver(true);
      return;
    }

    navigate(`/chapitre/${choice.next}`);
  };

  // Modification : vérifie partout (inventaire, équipement, accessoires, interceptor)
  const isChoiceAvailable = (choice) => {
    if (!choice.condition) return true;

    // ----- Ajout : gestion des conditions sur les stats -----
    if (choice.condition.stat) {
      const statName = choice.condition.stat;
      // On prend la stat dans caractéristiques ou à la racine de characterData
      const stats = characterData?.caractéristiques ?? characterData ?? {};
      const value = Number(stats[statName]);
      const target = Number(choice.condition.value);
      const op = choice.condition.operator;
      switch (op) {
        case ">":
          return value > target;
        case ">=":
          return value >= target;
        case "<":
          return value < target;
        case "<=":
          return value <= target;
        case "==":
        case "=":
          return value === target;
        case "!=":
          return value !== target;
        default:
          return false;
      }
    }
    // ----- Fin ajout -----

    if (choice.condition.item) {
      const normalized = (str) => str.replace(/_/g, "").toLowerCase();
      let count = 0;
      // Liste des propriétés à explorer
      const containers = [
        "inventaire",
        "équipement",
        "accessoires",
        "interceptor",
      ];
      containers.forEach((container) => {
        if (characterData?.[container]) {
          const obj = characterData[container];
          if (Array.isArray(obj)) {
            obj.forEach((item) => {
              if (typeof item === "string") {
                if (normalized(item) === normalized(choice.condition.item))
                  count++;
              } else if (
                item.nom &&
                normalized(item.nom) === normalized(choice.condition.item)
              ) {
                count += item.quantite ? item.quantite : 1;
              }
            });
          } else if (typeof obj === "object") {
            Object.entries(obj).forEach(([key, value]) => {
              if (normalized(key) === normalized(choice.condition.item)) {
                count += value;
              }
            });
          }
        }
      });

      const hasItem = count > 0;
      return choice.condition.hasItem ? hasItem : !hasItem;
    }

    return true;
  };

  // Rendu des choix : gère à la fois les tests de dés et les conditions d'inventaire
  const renderChoices = () => {
    // Spécifique : pas de choix pour le chapitre 358 (mini-jeu à la place)
    if (id === "358") return null;

    if (!chapterData || !Array.isArray(chapterData.choices)) return null;

    // Cas test de chance
    if (chapterData.diceRoll?.required && chapterData.testChance?.required) {
      if (diceTotal === null) {
        return <p>Veuillez lancer les dés pour continuer.</p>;
      }
      const chance = characterData?.caractéristiques?.chance ?? 0;
      if (diceTotal <= chance) {
        const successChoice = chapterData.choices.find((c) =>
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
      const failChoice = chapterData.choices.find((c) =>
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

    // Cas test d'habileté
    if (chapterData.diceRoll?.required && chapterData.testHabilete?.required) {
      if (diceTotal === null) {
        return <p>Veuillez lancer les dés pour continuer.</p>;
      }
      const habilete = characterData?.caractéristiques?.habilete ?? 0;
      if (diceTotal <= habilete) {
        const successChoice = chapterData.choices.find((c) =>
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
      const failChoice = chapterData.choices.find((c) =>
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

    // Cas test de dés avec choix numérotés
    if (
      chapterData.diceRoll?.required &&
      !chapterData.testChance?.required &&
      !chapterData.testHabilete?.required &&
      chapterData.choices.length > 1 &&
      chapterData.choices.some((choice) => /\d/.test(choice.label))
    ) {
      if (diceTotal === null) {
        return (
          <>
            {chapterData.choices.map((choice, index) => (
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
          {chapterData.choices.map((choice, index) => {
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

    // Cas test de dés avec un seul choix
    if (
      chapterData.diceRoll?.required &&
      !chapterData.testChance?.required &&
      !chapterData.testHabilete?.required &&
      chapterData.choices.length === 1
    ) {
      return chapterData.choices.map((choice, idx) => (
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

    // Cas général : choix avec/condition inventaire
    return chapterData.choices.map((choice, index) => {
      const available = isChoiceAvailable(choice);
      return (
        <button
          key={index}
          className="chapter-choice"
          onClick={() => available && handleChoiceClick(choice)}
          disabled={!available}
          style={!available ? { opacity: 0.6, cursor: "not-allowed" } : {}}
        >
          {choice.label}
        </button>
      );
    });
  };

  // Nouvelle partie : réinitialise tout et retourne à Home
  const handleNewGame = () => {
    localStorage.removeItem("selectedCharacter");
    localStorage.removeItem("characterData");
    window.location.href = "/"; // recharge la page et va sur Home
  };

  // Affichage spécial pour le chapitre 358 (mini-jeu course)
  if (id === "358") {
    return (
      <div className={`chapter chapter-${id}`}>
        <StatChangeNotification notifications={notifications} />

        <Modal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
          {characterData ? (
            <CharacterSheet data={characterData} />
          ) : (
            <p>Chargement de la fiche personnage...</p>
          )}
        </Modal>

        <GameRulesModal
          isOpen={isRulesOpen}
          onClose={() => setIsRulesOpen(false)}
        />

        <GameMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          mapImage={gameMap}
        />

        <VehiculeModal
          isOpen={isVehiculeOpen}
          onClose={() => setIsVehiculeOpen(false)}
          vehicleImage={interceptorImage}
        />

        <GameOverModal visible={isGameOver} />

        {loading && (
          <p className="loading-message">Chargement du chapitre...</p>
        )}
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
              <div className="chapter-btn-row">
                <CharacterSheetButton
                  onClick={() => setIsSheetOpen(true)}
                  label="Fiche du personnage"
                  icon={
                    <GiCharacter
                      size={22}
                      style={{ verticalAlign: "middle" }}
                    />
                  }
                  aria-label="Afficher la fiche du personnage"
                />
                <CharacterSheetButton
                  onClick={() => setIsRulesOpen(true)}
                  label="Règles du jeu"
                  icon={
                    <FcRules size={22} style={{ verticalAlign: "middle" }} />
                  }
                  aria-label="Afficher les règles du jeu"
                />
                <CharacterSheetButton
                  onClick={() => setIsMapOpen(true)}
                  label="Carte du jeu"
                  icon={
                    <FaMapMarkedAlt
                      size={22}
                      style={{ verticalAlign: "middle" }}
                    />
                  }
                  aria-label="Afficher la carte du jeu"
                />
                <CharacterSheetButton
                  onClick={() => setIsVehiculeOpen(true)}
                  label="Véhicule : Interceptor"
                  icon={
                    <FaCarSide size={22} style={{ verticalAlign: "middle" }} />
                  }
                  aria-label="Afficher le véhicule Interceptor"
                />
              </div>
            </div>

            <section className="chapter-text">
              {renderFormattedText(getPersonalizedText(chapterData.text))}
            </section>

            <CharacterSheetButton
              onClick={handleNewGame}
              label="Nouvelle partie"
              icon={
                <GiCharacter size={22} style={{ verticalAlign: "middle" }} />
              }
              aria-label="Commencer une nouvelle partie"
            />

            <RaceGame358 chapterData={chapterData} navigate={navigate} />
          </article>
        ) : (
          !loading &&
          !error && (
            <p className="error-message">
              Chapitre introuvable ou données invalides.
            </p>
          )
        )}

        <ScrollToTopButton />
      </div>
    );
  }

  // Affichage normal pour les autres chapitres
  return (
    <div
      className={`chapter chapter-${id}`}
      role="region"
      aria-label="Chapitre interactif"
      style={{ position: "relative" }}
    >
      <StatChangeNotification notifications={notifications} />

      <Modal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        {characterData ? (
          <CharacterSheet data={characterData} />
        ) : (
          <p>Chargement de la fiche personnage...</p>
        )}
      </Modal>

      <GameRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <GameMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        mapImage={gameMap}
      />

      <VehiculeModal
        isOpen={isVehiculeOpen}
        onClose={() => setIsVehiculeOpen(false)}
        vehicleImage={interceptorImage}
      />

      <GameOverModal visible={isGameOver} />

      {loading && <p className="loading-message">Chargement du chapitre...</p>}
      {error && <div className="error-message">Erreur : {error}</div>}

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

          <div className="chapter-image-container">
            <img
              src={chapterData.image ? chapterData.image : defaultPicture}
              alt={`Illustration du chapitre : ${chapterData.title}`}
              className="chapter-image"
              onError={(e) => {
                e.target.src = defaultPicture;
              }}
            />
            <div className="chapter-btn-row">
              <CharacterSheetButton
                onClick={() => setIsSheetOpen(true)}
                label="Fiche du personnage"
                icon={
                  <GiCharacter size={22} style={{ verticalAlign: "middle" }} />
                }
                aria-label="Afficher la fiche du personnage"
              />
              <CharacterSheetButton
                onClick={() => setIsRulesOpen(true)}
                label="Règles du jeu"
                icon={<FcRules size={22} style={{ verticalAlign: "middle" }} />}
                aria-label="Afficher les règles du jeu"
              />
              <CharacterSheetButton
                onClick={() => setIsMapOpen(true)}
                label="Carte du jeu"
                icon={
                  <FaMapMarkedAlt
                    size={22}
                    style={{ verticalAlign: "middle" }}
                  />
                }
                aria-label="Afficher la carte du jeu"
              />
              <CharacterSheetButton
                onClick={() => setIsVehiculeOpen(true)}
                label="Véhicule : Interceptor"
                icon={
                  <FaCarSide size={22} style={{ verticalAlign: "middle" }} />
                }
                aria-label="Afficher le véhicule Interceptor"
              />
            </div>
          </div>

          <section
            className={`chapter-text ${id === "0" ? "first-chapter" : ""}`}
          >
            {renderFormattedText(getPersonalizedText(chapterData.text))}
          </section>

          <CharacterSheetButton
            onClick={handleNewGame}
            label="Nouvelle partie"
            icon={<GiCharacter size={22} style={{ verticalAlign: "middle" }} />}
            aria-label="Commencer une nouvelle partie"
          />

          {chapterData.combat && (
            <Combat
              combatData={chapterData.combat}
              characterData={characterData}
              setCharacterData={setCharacterData}
              onEnd={(result) => {
                if (chapterData.combat.issue?.[result]?.next) {
                  navigate(
                    `/chapitre/${chapterData.combat.issue[result].next}`
                  );
                } else if (chapterData.combat.issue?.[result]?.isGameOver) {
                  setIsGameOver(true);
                }
              }}
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

      <ScrollToTopButton />
    </div>
  );
};

export default Chapter;
