import React from "react";

const NewGameButton = ({ onClick, children }) => (
  <button className="home__button" onClick={onClick}>
    {children}
  </button>
);

export default NewGameButton;
