import React from "react";
import defaultPicture from "../../assets/images/defaultPicture.webp";
import "./CharacterSheet.scss";

const CharacterSheet = ({ data }) => {
  if (!data) return <p>Aucune donnée personnage.</p>;

  // Utilise l'image du personnage ou l'image par défaut
  const imageSrc = data.image ? data.image : defaultPicture;

  return (
    <div className="character-sheet">
      <h2 className="character-name">{data.nom}</h2>
      <img src={imageSrc} alt={data.nom} className="character-image" />

      <section className="character-section">
        <h3>Caractéristiques</h3>
        <ul>
          <li>
            <strong>Habilete :</strong> {data.caractéristiques.habilete}
          </li>
          <li>
            <strong>Endurance :</strong> {data.caractéristiques.endurance}
          </li>
          <li>
            <strong>Chance :</strong> {data.caractéristiques.chance}
          </li>
          {/* Affiche Blindage UNIQUEMENT s'il existe ET est > 0 */}
          {"blindage" in data.caractéristiques &&
            data.caractéristiques.blindage > 0 && (
              <li>
                <strong>Blindage :</strong> {data.caractéristiques.blindage}
              </li>
            )}
        </ul>
      </section>

      <section className="character-section">
        <h3>Équipement</h3>
        <ul>
          {data.équipement &&
            Object.entries(data.équipement).map(([key, value]) => (
              <li key={key}>
                <strong>{key.replace(/_/g, " ")} :</strong> {value}
              </li>
            ))}
        </ul>
      </section>

      <section className="character-section">
        <h3>Interceptor</h3>
        <ul>
          {data.interceptor &&
            Object.entries(data.interceptor).map(([key, value]) => (
              <li key={key}>
                <strong>{key.replace(/_/g, " ")} :</strong> {value}
              </li>
            ))}
        </ul>
      </section>

      <section className="character-section">
        <h3>Accessoires</h3>
        <ul>
          {data.accessoires &&
            Object.entries(data.accessoires).map(([key, value]) => (
              <li key={key}>
                <strong>{key.replace(/_/g, " ")} :</strong> {value}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
};

export default CharacterSheet;
