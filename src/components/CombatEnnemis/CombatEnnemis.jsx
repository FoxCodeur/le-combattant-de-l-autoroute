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
      return <GiPistolGun color="#90caf9" style={{ marginRight: "0.3em" }} />;
    case "corps-à-corps":
      return <GiBroadsword color="#90caf9" />;
    case "motorisé":
      return (
        <GiRaceCar className="racecar-icon" style={{ marginRight: "0.3em" }} />
      );
    default:
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
 * Affiche la liste des ennemis du combat, leur image, nom, clan, habileté (avec icône dynamique) et endurance.
 * @param {object[]} ennemis - Liste des ennemis à afficher
 * @param {string} type - Type de combat (pour choisir l'icône)
 */
const CombatEnnemis = ({ ennemis, type }) => {
  if (!Array.isArray(ennemis) || ennemis.length === 0) return null;
  const habileteIcon = getCombatIcon(type);

  return (
    <section className="combat-ennemis">
      <h2 className="combat-title">
        Ennemi{ennemis.length > 1 ? "s" : ""} à affronter&nbsp;:
      </h2>
      <div className="ennemis-list">
        {ennemis.map((ennemi, idx) => (
          <div key={idx} className="ennemi-card">
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
            <div className="ennemi-info">
              <h3 className="ennemi-name">{ennemi.nom}</h3>
              {ennemi.clan && (
                <div className="ennemi-clan">
                  <span className="clan-label">Clan :</span>{" "}
                  <span className="clan-value">{ennemi.clan}</span>
                </div>
              )}
              <div className="ennemi-stats">
                <span className="ennemi-stat">
                  {habileteIcon}
                  {ennemi.habilete}
                </span>
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
