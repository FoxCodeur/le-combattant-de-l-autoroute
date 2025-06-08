import React from "react";
import { FaHeart } from "react-icons/fa";
import { GiPistolGun, GiBroadsword, GiRaceCar } from "react-icons/gi";
import "./CombatEnnemi.scss";

/**
 * Sélectionne dynamiquement l'icône affichée pour l'habileté selon le type de combat.
 * @param {string} type - Type du combat ("tir", "corps-à-corps", "motorise")
 * @returns {JSX.Element} L'icône correspondante
 */
const getCombatIcon = (type) => {
  switch (type) {
    case "tir":
      // Icône revolver pour un combat à distance (armes à feu)
      return (
        <GiPistolGun
          color="#90caf9"
          size={18}
          style={{ marginRight: "0.3em" }}
        />
      );
    case "corps-à-corps":
      // Icône épée pour le corps-à-corps
      return (
        <GiBroadsword
          color="#90caf9"
          size={18}
          style={{ marginRight: "0.3em" }}
        />
      );
    case "motorise":
      // Icône voiture de course RED et GROSSE, stylée via SCSS
      return (
        <GiRaceCar className="racecar-icon" style={{ marginRight: "0.3em" }} />
      );
    default:
      // Par défaut, une épée
      return (
        <GiBroadsword
          color="#90caf9"
          size={18}
          style={{ marginRight: "0.3em" }}
        />
      );
  }
};

/**
 * Affiche la liste des ennemis du combat, leur image, nom, habileté (avec icône dynamique) et endurance.
 * @param {object[]} ennemis - Liste des ennemis à afficher
 * @param {string} type - Type de combat (pour choisir l'icône)
 */
const CombatEnnemis = ({ ennemis, type }) => {
  if (!Array.isArray(ennemis) || ennemis.length === 0) return null;
  // On choisit l'icône selon le type de combat une seule fois (tous les ennemis d'un combat partagent le même type)
  const habileteIcon = getCombatIcon(type);

  return (
    <section className="combat-ennemis">
      {/* Titre de la section combat */}
      <h2 className="combat-title">
        Ennemi{ennemis.length > 1 ? "s" : ""} à affronter&nbsp;:
      </h2>
      <div className="ennemis-list">
        {/* Boucle sur chaque ennemi pour l'afficher */}
        {ennemis.map((ennemi, idx) => (
          <div key={idx} className="ennemi-card">
            {/* Image de l'ennemi, avec fallback si image cassée */}
            <div className="ennemi-image-wrapper">
              <img
                src={ennemi.image}
                alt={ennemi.nom}
                className="ennemi-image"
                onError={(e) => {
                  const defaultSrc = "/images/ennemis/default.webp";
                  if (!e.target.src.endsWith(defaultSrc)) {
                    e.target.src = defaultSrc;
                  }
                }}
              />
            </div>
            {/* Infos texte de l'ennemi */}
            <div className="ennemi-info">
              <h3 className="ennemi-name">{ennemi.nom}</h3>
              <div className="ennemi-stats">
                {/* Habileté avec icône dynamique */}
                <span className="ennemi-stat">
                  {habileteIcon}
                  {ennemi.habilete}
                </span>
                {/* Endurance avec icône cœur */}
                <span className="ennemi-stat">
                  <FaHeart
                    className="heart-icon"
                    color="#ff3860"
                    size={16}
                    style={{ marginRight: "0.3em" }}
                  />
                  {ennemi.endurance}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CombatEnnemis;
