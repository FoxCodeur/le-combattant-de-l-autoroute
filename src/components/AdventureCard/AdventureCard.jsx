import React from "react";

const AdventureCard = ({ image, title, age, description, children }) => (
  <div className="home__card">
    <img src={image} alt={title} className="home__card-image" />
    <h2>{title}</h2>
    <p className="home__card-age">Âge : {age} ans</p>
    <p>{description}</p>
    {children}
  </div>
);

export default AdventureCard;
