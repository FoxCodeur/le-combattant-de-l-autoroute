import React, { useState, useCallback } from "react";
import ChapterContext from "./ChapterContext";

const ChapterProvider = ({ children }) => {
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      value={{ chapterData, setChapterData, fetchChapter, loading, error }}
    >
      {children}
    </ChapterContext.Provider>
  );
};

export default ChapterProvider;
