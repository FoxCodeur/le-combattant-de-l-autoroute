import React from "react";
import "./CharacterSheetButton.scss";

// Ajout des props label et icon pour rendre le bouton réutilisable
const CharacterSheetButton = ({
  onClick,
  label = "Fiche du personnage",
  icon,
}) => {
  return (
    <button className="character-sheet-btn" onClick={onClick}>
      {icon ? <span style={{ marginRight: "0.5em" }}>{icon}</span> : null}
      {label}
    </button>
  );
};

export default CharacterSheetButton;
