import React from "react";
import { FaHeart } from "react-icons/fa";
import { GiPistolGun, GiBroadsword, GiRaceCar } from "react-icons/gi";
import "./CombatEnnemi.scss";

/**
 * Retourne l'icône correspondant à la statistique principale à gauche,
 * selon le type de combat (tir, corps-à-corps, motorisé, etc).
 */
const getLeftIcon = (type) => {
  switch (type) {
    case "tir":
      // Icône pistolet pour les combats à distance
      return <GiPistolGun color="#90caf9" style={{ marginRight: "0.3em" }} />;
    case "corps-à-corps":
      // Icône épée pour les combats au corps à corps
      return <GiBroadsword color="#90caf9" style={{ marginRight: "0.3em" }} />;
    case "motorisé":
      // Icône voiture pour les combats motorisés
      return (
        <GiRaceCar className="racecar-icon" style={{ marginRight: "0.3em" }} />
      );
    default:
      // Par défaut, on affiche une épée
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
 * Composant d'affichage des ennemis à affronter dans un combat.
 * Affiche chaque ennemi sous forme de carte avec image, nom, clan, et stats principales.
 *
 * Props :
 * - ennemis : array d'objets ennemis à afficher
 * - type : type du combat ('tir', 'corps-à-corps', 'motorisé', etc)
 * - activeIdx : index de l'ennemi actuellement sélectionné
 * - selectEnemy : fonction appelée lors d'un clic sur un ennemi
 * - highlightLostHp : booléen pour animer la perte de points de vie
 */
const CombatEnnemis = ({
  ennemis,
  type,
  activeIdx,
  selectEnemy,
  highlightLostHp,
}) => {
  // Si pas d'ennemis à afficher, on ne retourne rien
  if (!Array.isArray(ennemis) || ennemis.length === 0) return null;

  // Normalisation du type pour éviter les erreurs de casse/espaces
  const typeCombat = (type || "").trim().toLowerCase();

  return (
    <section className="combat-ennemis">
      {/* Titre dynamique selon le nombre d'ennemis */}
      <h2 className="combat-title">
        Ennemi{ennemis.length > 1 ? "s" : ""} à affronter&nbsp;:
      </h2>
      <div className="ennemis-list">
        {ennemis.map((ennemi, idx) => {
          const isSelected = activeIdx === idx;
          const lostHp = highlightLostHp ? ennemi.lostHp : 0;

          /**
           * Affichage des stats principales :
           * - Pour un combat motorisé : puissance à gauche, blindage à droite
           * - Pour un combat tir/corps-à-corps : habileté à gauche, endurance à droite
           */
          let leftValue, rightValue;
          if (typeCombat === "motorisé" || typeCombat === "motorise") {
            leftValue = ennemi.puissance ?? 0;
            rightValue = ennemi.currentBlindage ?? ennemi.blindage;
          } else {
            leftValue = ennemi.habilete ?? 0;
            rightValue = ennemi.currentEndurance ?? ennemi.endurance;
          }

          return (
            <div
              key={idx}
              className={`ennemi-card${isSelected ? " selected" : ""}`}
              // Permet de sélectionner un ennemi lors du clic
              onClick={() => selectEnemy(idx)}
              style={
                isSelected
                  ? { borderColor: "#ffcc00", boxShadow: "0 0 12px #ffcc0080" }
                  : {}
              }
            >
              {/* Affichage de l'image de l'ennemi, avec fallback en cas d'erreur */}
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
                {/* Nom de l'ennemi */}
                <h3 className="ennemi-name">{ennemi.nom}</h3>
                {/* Clan de l'ennemi, si renseigné */}
                {ennemi.clan && (
                  <div className="ennemi-clan">
                    <span className="clan-label">Clan :</span>{" "}
                    <span className="clan-value">{ennemi.clan}</span>
                  </div>
                )}
                {/* Stats principales, à gauche et à droite */}
                <div
                  className="ennemi-stats"
                  style={{ justifyContent: "space-between" }}
                >
                  {/* Stat de gauche : habileté ou puissance */}
                  <span className="ennemi-stat habilete">
                    {getLeftIcon(typeCombat)}
                    {leftValue}
                  </span>
                  {/* Stat de droite : endurance ou blindage, avec cœur animé en cas de dégâts */}
                  <span
                    className={`ennemi-stat endurance${
                      lostHp > 0 ? " lost-hp" : ""
                    }`}
                    style={{ position: "relative" }}
                  >
                    <span
                      className={`heart-icon${
                        lostHp > 0 ? " heart-animate" : ""
                      }`}
                    >
                      <FaHeart
                        color="#ff3860"
                        size={22}
                        style={{ marginRight: "0.3em" }}
                      />
                    </span>
                    {rightValue}
                    {/* Animation de points de vie perdus */}
                    {lostHp > 0 && (
                      <span className="lost-hp-effect">-{lostHp}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CombatEnnemis;
