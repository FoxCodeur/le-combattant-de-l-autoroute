import React from "react";
import "./CharacterSheet.scss";

const CharacterSheet = ({ data }) => {
  if (!data) return <p>Aucune donnée personnage.</p>;

  return (
    <div className="character-sheet">
      <h2 className="character-name">{data.nom}</h2>
      {data.image && (
        <img src={data.image} alt={data.nom} className="character-image" />
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
