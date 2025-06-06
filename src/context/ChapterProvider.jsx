import React, { useState, useCallback, useEffect } from "react";
import ChapterContext from "./ChapterContext";
import { fetchChapterById, fetchCharacterData } from "../utils/chapterApi";

const ChapterProvider = ({ children }) => {
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [characterData, setCharacterData] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(
    localStorage.getItem("selectedCharacter") || "Skarr"
  );

  // Persistance: sauvegarde la fiche personnage à chaque modification
  useEffect(() => {
    if (characterData) {
      localStorage.setItem("characterData", JSON.stringify(characterData));
    }
  }, [characterData]);

  // Surveille les changements du personnage sélectionné (autres onglets)
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
    const saved = localStorage.getItem("characterData");
    if (saved) {
      setCharacterData(JSON.parse(saved));
    } else {
      fetchCharacterData(selectedCharacter)
        .then((data) => {
          // Ajoute le tableau pour le suivi si absent
          if (!Array.isArray(data.chapitresModifies)) {
            data.chapitresModifies = [];
          }
          setCharacterData(data);
        })
        .catch((err) => {
          console.error("Erreur chargement fiche personnage :", err);
          setCharacterData(null);
        });
    }
  }, [selectedCharacter]);

  // Pour changer de personnage ET repartir d'une fiche propre
  const selectCharacter = (characterName) => {
    localStorage.setItem("selectedCharacter", characterName);
    localStorage.removeItem("characterData");
    setSelectedCharacter(characterName);
  };

  // Charge un chapitre à partir de son id
  const fetchChapter = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchChapterById(id);
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
        setCharacterData,
        selectCharacter,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
};

export default ChapterProvider;
