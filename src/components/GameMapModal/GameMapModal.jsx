import React from "react";
import Modal from "../Modal/Modal";
import "./GameMapModal.scss";

const GameMapModal = ({ isOpen, onClose, mapImage }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="game-map-modal">
      <h2>Carte du jeu</h2>
      <div className="game-map-content">
        <img src={mapImage} alt="Carte du jeu" className="game-map-image" />
      </div>
    </div>
  </Modal>
);

export default GameMapModal;
