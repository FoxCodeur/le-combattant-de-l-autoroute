import React, { useState, useMemo, useCallback } from "react";
import CombatContext from "./CombatContext";

// Fonction utilitaire pour initialiser les ennemis avec propriétés dynamiques
function getInitialEnemies(ennemis) {
  return ennemis.map((e) => ({
    ...e,
    currentEndurance: e.endurance,
    currentBlindage: e.blindage,
    dead: false,
  }));
}

const CombatProvider = ({
  children,
  combatData,
  playerStats,
  setPlayerStats,
  onCombatEnd,
}) => {
  // Initialisation des ennemis pour le combat
  const [enemies, setEnemies] = useState(
    getInitialEnemies(combatData.ennemis || [])
  );
  // L'ennemi sélectionné par défaut est le premier vivant
  const [activeEnemyIdx, setActiveEnemyIdx] = useState(
    enemies.findIndex((e) => !e.dead)
  );
  const [combatOver, setCombatOver] = useState(false);

  // Fonction pour sélectionner un ennemi actif (par index)
  const selectEnemy = useCallback(
    (idx) => {
      if (!enemies[idx] || enemies[idx].dead) return;
      setActiveEnemyIdx(idx);
    },
    [enemies]
  );

  // Fonction pour appliquer des dégâts
  const applyDamage = useCallback(
    ({ to, value }) => {
      if (to === "player") {
        setPlayerStats((prev) => {
          const newEndurance = Math.max(
            0,
            prev.caractéristiques.endurance - value
          );
          // Si le joueur n'a plus d'endurance => défaite
          if (newEndurance <= 0 && typeof onCombatEnd === "function") {
            setCombatOver(true);
            onCombatEnd("failure");
          }
          return {
            ...prev,
            caractéristiques: {
              ...prev.caractéristiques,
              endurance: newEndurance,
            },
          };
        });
      } else if (typeof to === "number") {
        setEnemies((prev) =>
          prev.map((enemy, idx) =>
            idx === to
              ? {
                  ...enemy,
                  currentEndurance: Math.max(
                    0,
                    (enemy.currentEndurance ?? enemy.endurance) - value
                  ),
                  dead:
                    (enemy.currentEndurance ?? enemy.endurance) - value <= 0,
                }
              : enemy
          )
        );
        // Vérification de la fin du combat (tous morts)
        const allDead = (prev) =>
          prev.every(
            (enemy) =>
              enemy.dead || (enemy.currentEndurance ?? enemy.endurance) <= 0
          );
        setEnemies((prev) => {
          if (allDead(prev) && typeof onCombatEnd === "function") {
            setCombatOver(true);
            onCombatEnd("success");
          }
          return prev;
        });
      }
    },
    [setPlayerStats, onCombatEnd]
  );

  const contextValue = useMemo(
    () => ({
      enemies,
      activeEnemyIdx,
      selectEnemy,
      applyDamage,
      combatOver,
      setActiveEnemyIdx,
      setEnemies,
    }),
    [enemies, activeEnemyIdx, combatOver, applyDamage, selectEnemy]
  );

  return (
    <CombatContext.Provider value={contextValue}>
      {children}
    </CombatContext.Provider>
  );
};

export default CombatProvider;
