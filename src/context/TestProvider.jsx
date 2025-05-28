import React, { useState, useCallback } from "react";
import TestContext from "./TestContext";

const TestProvider = ({ children }) => {
  const [diceTotal, setDiceTotal] = useState(null);
  const [validChoice, setValidChoice] = useState(null);

  // Fonction pour normaliser les accents
  const normalize = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Fonction de gestion du test (habileté, chance, hasard)
  const handleDiceResult = useCallback((total, chapterData, characterData) => {
    setDiceTotal(total);

    // Test d'habileté
    if (chapterData.testHabilete?.required && characterData) {
      const habilete = characterData.caractéristiques.habilete;
      let matchedChoice = null;

      if (chapterData.choices && Array.isArray(chapterData.choices)) {
        if (total <= habilete) {
          matchedChoice = chapterData.choices.find((choice) =>
            normalize(choice.label.toLowerCase()).includes("reuss")
          );
        } else {
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

    // Test de chance
    if (chapterData.testChance?.required && characterData) {
      const chance = characterData.caractéristiques.chance;
      let matchedChoice = null;

      if (chapterData.choices && Array.isArray(chapterData.choices)) {
        if (total <= chance) {
          matchedChoice = chapterData.choices.find((choice) =>
            normalize(choice.label.toLowerCase()).includes("reuss")
          );
        } else {
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

    // Test de hasard classique
    if (chapterData.choices && Array.isArray(chapterData.choices)) {
      const matchedChoice = chapterData.choices.find((choice) => {
        const numbers = choice.label.match(/\d+/g)?.map(Number);
        return numbers?.includes(total);
      });
      setValidChoice(matchedChoice || null);
    }
  }, []);

  // Remise à zéro du test (appelée quand on change de chapitre)
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
