import React from "react";
import "./CharacterSheetButton.scss";

const CharacterSheetButton = ({ onClick }) => {
  return (
    <button className="character-sheet-btn" onClick={onClick}>
      Fiche du personnage
    </button>
  );
};

export default CharacterSheetButton;
