import React, { useState, useCallback, useEffect } from "react";
import ChapterContext from "./ChapterContext";

const ChapterProvider = ({ children }) => {
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ajoute cet état pour la fiche personnage
  const [characterData, setCharacterData] = useState(null);

  // Nouvel état pour le personnage sélectionné
  const [selectedCharacter, setSelectedCharacter] = useState(
    localStorage.getItem("selectedCharacter") || "Skarr"
  );

  // Surveille le localStorage à chaque navigation
  useEffect(() => {
    const onStorage = () => {
      const char = localStorage.getItem("selectedCharacter") || "Skarr";
      setSelectedCharacter(char);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Recharge la fiche personnage à chaque changement de selectedCharacter
  useEffect(() => {
    const fileName = `CharacterData${selectedCharacter}.json`;
    fetch(`/Data/chapitres/${fileName}`)
      .then((res) => res.json())
      .then(setCharacterData)
      .catch((err) => {
        console.error("Erreur chargement fiche personnage :", err);
        setCharacterData(null);
      });
  }, [selectedCharacter]);

  const fetchChapter = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/Data/chapitres/${id}.json`);
      if (!response.ok) {
        throw new Error(`Chapitre introuvable (code ${response.status})`);
      }

      const data = await response.json();
      setChapterData(data);
    } catch (err) {
      setError(err.message || "Erreur inconnue");
      console.error("Erreur lors du chargement du chapitre :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ChapterContext.Provider
      value={{
        chapterData,
        setChapterData,
        fetchChapter,
        loading,
        error,
        characterData,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
};

export default ChapterProvider;
