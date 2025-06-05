import React from "react";
import { FaHeart } from "react-icons/fa";
import { GiBroadsword } from "react-icons/gi";
import "./CombatEnnemi.scss";

const CombatEnnemis = ({ ennemis }) => {
  if (!Array.isArray(ennemis) || ennemis.length === 0) return null;
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
              <div className="ennemi-stats">
                <span className="ennemi-stat">
                  <GiBroadsword
                    color="#90caf9"
                    size={18}
                    style={{ marginRight: "0.3em" }}
                  />
                  {ennemi.habilete}
                </span>
                <span className="ennemi-stat">
                  <FaHeart
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
