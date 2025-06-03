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

      {/* Affiche l'âge s'il est présent */}
      {data.age && (
        <div className="character-age">
          <strong>Âge :</strong> {data.age}
        </div>
      )}

      <section className="character-section">
        <h3>Caractéristiques</h3>
        <ul>
          {Object.entries(data.caractéristiques).map(([key, value]) => (
            <li key={key}>
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)} :</strong>{" "}
              {value}
            </li>
          ))}
        </ul>
      </section>

      <section className="character-section">
        <h3>Équipement</h3>
        <ul>
          {Object.entries(data.équipement).map(([key, value]) => (
            <li key={key}>
              <strong>{key.replace(/_/g, " ")} :</strong> {value}
            </li>
          ))}
        </ul>
      </section>

      <section className="character-section">
        <h3>Interceptor</h3>
        <ul>
          {Object.entries(data.interceptor).map(([key, value]) => (
            <li key={key}>
              <strong>{key.replace(/_/g, " ")} :</strong> {value}
            </li>
          ))}
        </ul>
      </section>

      <section className="character-section">
        <h3>Accessoires</h3>
        <ul>
          {Object.entries(data.accessoires).map(([key, value]) => (
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
