import React, { useState, useCallback } from "react";
import TestContext from "./TestContext";

/**
 * TestProvider gère la logique de sélection du bon "choix" selon le résultat du dé :
 * - Test d'habileté : succès/échec selon la caractéristique du personnage
 * - Test de chance  : succès/échec selon la caractéristique du personnage
 * - Hasard pur      : correspondance directe avec le label du choix (par numéro, plage, ou label sans chiffre)
 */
const TestProvider = ({ children }) => {
  // Résultat courant du lancer de dé (null = pas encore lancé)
  const [diceTotal, setDiceTotal] = useState(null);
  // Le choix valide à proposer après un test (null = aucun)
  const [validChoice, setValidChoice] = useState(null);

  // Supprime les accents des labels pour des comparaisons plus fiables
  const normalize = (str) =>
    str && typeof str === "string"
      ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : "";

  /**
   * Gère le résultat du lancer de dé pour déterminer quel bouton afficher.
   * @param {number} total - Résultat du lancer de dé
   * @param {object} chapterData - Données du chapitre courant
   * @param {object} characterData - Données du personnage courant
   */
  const handleDiceResult = useCallback((total, chapterData, characterData) => {
    setDiceTotal(total);

    // ----- 1. Test d'HABILETÉ -----
    if (chapterData.testHabilete?.required && characterData) {
      const habilete = characterData.caractéristiques.habilete;
      let matchedChoice = null;

      if (chapterData.choices && Array.isArray(chapterData.choices)) {
        if (total <= habilete) {
          // Recherche un choix contenant "réussite" ou "reussi"
          matchedChoice = chapterData.choices.find((choice) =>
            normalize(choice.label.toLowerCase()).includes("reuss")
          );
        } else {
          // Recherche un choix contenant "échec" ou variantes
          matchedChoice = chapterData.choices.find((choice) => {
            const label = normalize(choice.label.toLowerCase());
            return (
              label.includes("echec") ||
              label.includes("echou") ||
              label.includes("maladresse")
            );
          });
        }
      }
      setValidChoice(matchedChoice || null);
      return;
    }

    // ----- 2. Test de CHANCE -----
    if (chapterData.testChance?.required && characterData) {
      const chance = characterData.caractéristiques.chance;
      let matchedChoice = null;

      if (chapterData.choices && Array.isArray(chapterData.choices)) {
        if (total <= chance) {
          // Recherche un choix contenant "réussite" ou "reussi"
          matchedChoice = chapterData.choices.find((choice) =>
            normalize(choice.label.toLowerCase()).includes("reuss")
          );
        } else {
          // Recherche un choix contenant "échec" ou variantes
          matchedChoice = chapterData.choices.find((choice) => {
            const label = normalize(choice.label.toLowerCase());
            return (
              label.includes("echec") ||
              label.includes("echou") ||
              label.includes("malchance")
            );
          });
        }
      }
      setValidChoice(matchedChoice || null);
      return;
    }

    // ----- 3. Hasard pur : gère labels avec ou sans chiffre -----
    if (chapterData.choices && Array.isArray(chapterData.choices)) {
      const matchedChoice = chapterData.choices.find((choice) => {
        if (!choice.label) return false;
        const numbers = choice.label.match(/\d+/g)?.map(Number);

        // S'il n'y a PAS de chiffre dans le label ("Next...") => ce bouton est toujours valide après le dé !
        if (!numbers || numbers.length === 0) return true;

        // Gestion d'un label du type "1-6" (plage)
        if (choice.label.includes("-")) {
          const [min, max] = numbers;
          return total >= min && total <= max;
        }
        // Gestion d'un label du type "3 ou 5" ou "3,5"
        if (choice.label.includes("ou") || choice.label.includes(",")) {
          return numbers.includes(total);
        }
        // Gestion d'un label d'un seul chiffre ("3")
        return numbers[0] === total;
      });
      setValidChoice(matchedChoice || null);
    }
  }, []);

  /**
   * Remise à zéro du test lors d'un changement de chapitre
   */
  const resetTest = () => {
    setDiceTotal(null);
    setValidChoice(null);
  };

  return (
    <TestContext.Provider
      value={{
        diceTotal,
        validChoice,
        handleDiceResult,
        resetTest,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export default TestProvider;
