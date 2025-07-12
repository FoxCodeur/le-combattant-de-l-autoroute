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
import CombatEnnemis from "../../components/CombatEnnemis/CombatEnnemis";
import GameOverModal from "../../components/GameOverModal/GameOverModal";
import GameRulesModal from "../../components/GameRulesModal/GameRulesModal";
import GameMapModal from "../../components/GameMapModal/GameMapModal";
import "./Chapter.scss";
import defaultPicture from "../../assets/images/defaultPicture.webp";
import gameMap from "../../assets/images/map.webp"; // Ajoute ton image ici

// Utilisation de GiCharacter et FcRules
import { GiCharacter } from "react-icons/gi";
import { FcRules } from "react-icons/fc";
import { FaMapMarkedAlt } from "react-icons/fa"; // Icône pour la carte

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
  const [isMapOpen, setIsMapOpen] = useState(false); // état pour la carte

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

  const renderChoices = () => {
    if (!chapterData || !Array.isArray(chapterData.choices)) return null;

    const filteredChoices = chapterData.choices.filter(isChoiceAvailable);

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

      <GameRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <GameMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        mapImage={gameMap}
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
            </div>
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
    </div>
  );
};

export default Chapter;
