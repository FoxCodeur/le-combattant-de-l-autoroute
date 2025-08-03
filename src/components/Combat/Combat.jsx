import React, { useState, useEffect } from "react";
import DiceRoll from "../DiceRoll/DiceRoll";
import CombatEnnemis from "../CombatEnnemis/CombatEnnemis";
import "./Combat.scss"; // Assurez-vous que ce fichier est bien importé

const Combat = ({ combatData, characterData, setCharacterData, onEnd }) => {
  const { type, ennemis, modificateursCombat, diceRoll, issue } = combatData;

  // Initialisation de l'état des ennemis (blindage/endurance en cours, etc)
  const [enemies, setEnemies] = useState(
    ennemis.map((e) => ({
      ...e,
      currentEndurance: e.endurance,
      currentBlindage: e.blindage,
      dead: false,
      lostHp: 0,
    }))
  );

  // Trouver le premier ennemi vivant pour initialiser le combat
  const getFirstAliveIdx = (arr) =>
    arr.findIndex((e) =>
      type &&
      (type.trim().toLowerCase() === "motorisé" ||
        type.trim().toLowerCase() === "motorise")
        ? (e.currentBlindage ?? e.blindage) > 0
        : (e.currentEndurance ?? e.endurance) > 0
    );

  const [activeIdx, setActiveIdx] = useState(getFirstAliveIdx(ennemis));
  const [roundResult, setRoundResult] = useState("");
  const [combatResult, setCombatResult] = useState(null);
  const [alreadyNavigated, setAlreadyNavigated] = useState(false);

  // Vérifie si tous les ennemis sont morts pour finir le combat
  useEffect(() => {
    if (!alreadyNavigated) {
      const allDead = enemies.every((e) =>
        type &&
        (type.trim().toLowerCase() === "motorisé" ||
          type.trim().toLowerCase() === "motorise")
          ? (e.currentBlindage ?? e.blindage) <= 0
          : (e.currentEndurance ?? e.endurance) <= 0
      );
      if (allDead) {
        setCombatResult("success");
        setAlreadyNavigated(true);
        if (onEnd) onEnd("success");
      }
    }
  }, [enemies, alreadyNavigated, type, onEnd]);

  // Sélection d'un ennemi à attaquer
  const handleSelect = (idx) => {
    if (enemies[idx].dead) return;
    setActiveIdx(idx);
    setRoundResult("");
  };

  // Dégâts sur le joueur (blindage véhicule si motorisé, sinon endurance)
  const damagePlayer = (value) => {
    let updatedCharacter = JSON.parse(JSON.stringify(characterData));
    if (
      type &&
      (type.trim().toLowerCase() === "motorisé" ||
        type.trim().toLowerCase() === "motorise")
    ) {
      if (
        updatedCharacter.interceptor &&
        updatedCharacter.interceptor.blindage > 0
      ) {
        updatedCharacter.interceptor.blindage = Math.max(
          0,
          updatedCharacter.interceptor.blindage - value
        );
      } else {
        updatedCharacter.caractéristiques.endurance = Math.max(
          0,
          updatedCharacter.caractéristiques.endurance - value
        );
      }
    } else {
      updatedCharacter.caractéristiques.endurance = Math.max(
        0,
        updatedCharacter.caractéristiques.endurance - value
      );
    }
    setCharacterData(updatedCharacter);

    // Nouvelle logique : mort si blindage tombe à 0 en motorisé, sinon si endurance à 0
    if (
      type &&
      (type.trim().toLowerCase() === "motorisé" ||
        type.trim().toLowerCase() === "motorise")
    ) {
      if (
        updatedCharacter.interceptor &&
        updatedCharacter.interceptor.blindage <= 0
      ) {
        setCombatResult("failure");
        if (onEnd) onEnd("failure");
      }
    } else {
      if (updatedCharacter.caractéristiques.endurance <= 0) {
        setCombatResult("failure");
        if (onEnd) onEnd("failure");
      }
    }
  };

  // Dégâts sur l'ennemi (blindage si motorisé, sinon endurance)
  const damageEnemy = (idx, value) => {
    setEnemies((prev) =>
      prev.map((e, i) => {
        if (i !== idx) return e;
        if (
          type &&
          (type.trim().toLowerCase() === "motorisé" ||
            type.trim().toLowerCase() === "motorise") &&
          e.currentBlindage !== undefined
        ) {
          const nextBlindage = Math.max(0, e.currentBlindage - value);
          return {
            ...e,
            currentBlindage: nextBlindage,
            dead: nextBlindage <= 0,
            lostHp: value,
          };
        } else {
          const nextEndurance = Math.max(0, e.currentEndurance - value);
          return {
            ...e,
            currentEndurance: nextEndurance,
            dead: nextEndurance <= 0,
            lostHp: value,
          };
        }
      })
    );
    setTimeout(() => {
      setEnemies((prev) =>
        prev.map((e, i) => (i === idx ? { ...e, lostHp: 0 } : e))
      );
    }, 600);
  };

  // Gestion du round de combat (résolution du jet de dés)
  const handleRound = (playerDice) => {
    if (enemies[activeIdx]?.dead || combatResult) return;
    const enemy = enemies[activeIdx];
    const enemyDice =
      Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);

    let playerVal, enemyVal;
    const typeTrimmed = type ? type.trim().toLowerCase() : "";

    // Calcul des scores selon le type de combat
    if (typeTrimmed === "tir") {
      playerVal = playerDice + (characterData.caractéristiques.habilete ?? 0);
      enemyVal = enemyDice + (enemy.habilete ?? 0);
    } else if (typeTrimmed === "motorisé" || typeTrimmed === "motorise") {
      const puissanceVehicule =
        characterData.interceptor &&
        typeof characterData.interceptor.puissance_De_Feu === "number"
          ? characterData.interceptor.puissance_De_Feu
          : 0;
      playerVal = playerDice + puissanceVehicule;
      enemyVal = enemyDice + (enemy.puissance ?? 0);
    } else {
      playerVal = playerDice + (characterData.caractéristiques.habilete ?? 0);
      enemyVal = enemyDice + (enemy.habilete ?? 0);
    }

    // Détermination du résultat du round, gestion du cas d'égalité (aucun dégât)
    if (playerVal > enemyVal) {
      damageEnemy(activeIdx, modificateursCombat?.degatsAdversaire ?? 2);
      setRoundResult(
        `Ton score : ${playerVal} / Score ennemi : ${enemyVal} — Tu touches l’ennemi !`
      );
    } else if (enemyVal > playerVal) {
      damagePlayer(modificateursCombat?.degatsJoueur ?? 2);
      setRoundResult(
        `Ton score : ${playerVal} / Score ennemi : ${enemyVal} — L’ennemi te touche !`
      );
    } else {
      setRoundResult(
        `Ton score : ${playerVal} / Score ennemi : ${enemyVal} — Égalité ! Relance les dés.`
      );
    }
  };

  // Affichage si combat terminé (victoire/défaite)
  if (combatResult) {
    return (
      <div className="combat-end">
        <p>
          {combatResult === "success" ? issue.success.text : issue.failure.text}
        </p>
      </div>
    );
  }

  const canFight = enemies[activeIdx] && !enemies[activeIdx].dead;
  const typeCombat = type ? type.trim().toLowerCase() : "";
  const enemy = enemies[activeIdx];

  // Récapitulatif affiché sous les dés, dépend du type de combat
  let recapStats;
  if (typeCombat === "motorisé" || typeCombat === "motorise") {
    recapStats = (
      <>
        <strong>Blindage véhicule :</strong>{" "}
        {characterData.interceptor?.blindage ?? 0}
        {" | "}
        <strong>Endurance joueur :</strong>{" "}
        {characterData.caractéristiques.endurance}
        {" | "}
        <strong>Blindage ennemi :</strong>{" "}
        {enemy?.currentBlindage ?? enemy?.blindage ?? 0}
        {" | "}
        <strong>Puissance ennemi :</strong> {enemy?.puissance ?? "N/A"}
      </>
    );
  } else {
    recapStats = (
      <>
        <strong>Endurance joueur :</strong>{" "}
        {characterData.caractéristiques.endurance}
        {" | "}
        <strong>Endurance ennemi :</strong>{" "}
        {enemy?.currentEndurance ?? enemy?.endurance ?? 0}
        {" | "}
        <strong>Habileté ennemi :</strong> {enemy?.habilete ?? "N/A"}
      </>
    );
  }

  return (
    <div className="combat-container">
      <CombatEnnemis
        ennemis={enemies}
        type={type}
        activeIdx={activeIdx}
        selectEnemy={handleSelect}
        highlightLostHp
      />
      {canFight && (
        <div className="combat-actions">
          <DiceRoll
            numberOfDice={diceRoll?.numberOfDice || 2}
            onResult={handleRound}
          />
          {roundResult && <p className="combat-result">{roundResult}</p>}
          <div className="combat-recap">{recapStats}</div>
        </div>
      )}
      {!canFight && (
        <div className="combat-actions">
          <p>L’ennemi est vaincu ! Sélectionne-en un autre si possible.</p>
        </div>
      )}
    </div>
  );
};

export default Combat;
