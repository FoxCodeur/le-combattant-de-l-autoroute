import React from "react";
import Modal from "../Modal/Modal";
import renderFormattedText from "../../utils/renderFormattedText";
import "./GameRulesModal.scss";

const rulesText = `
Un **livre-jeu** est une aventure interactive : tu y incarnes un personnage et tu prends des décisions qui influencent le déroulement de l’histoire. À chaque étape, tes choix, tes caractéristiques et à certains moments, des lancers de dés déterminent ce qui t’arrive. C’est bien toi le héros !

Bienvenue dans *Le Combattant de l’Autoroute* !

### Les caractéristiques du personnage sélectionné.

- **Endurance** : La vitalité du héros : si elle tombe à zéro, ce dernier meurt.
- **Habileté** : L’adresse est cette capacité de chaque individu à concrétiser des actions qui demandent de la précision.
- **Chance** : La faculté d’échapper aux dangers ou de profiter d’un coup du sort, mise à l’épreuve lors des situations incertaines.

### Caractéristiques du véhicule

- **Blindage** : L’armature et les renforts de ton véhicule constituent son blindage. À chaque dommage subi, il diminue : s’il atteint zéro, c'est la fin de l'aventure.
- **Puissance de feu** : Indique la force de frappe du véhicule lors des combats.

### Lancers de dés

- **Déroulement de l'épreuve** : Clique sur le bouton lancer les dés lorsque le jeu te le demande : test de hasard, chance, habileté, modificateur narratif.
- Les tests de chance ou d’habileté interviennent lors de situations à risque ou d’actions particulières.

### Choix & Objets

- Certains choix nécessitent l'obtention d'objets.
- Les conséquences d'une décision prise peuvent affecter tes caractéristiques ou ton équipement. (ajout, retrait d'objet, points d'endurance, blindage...)

Bonne aventure !
`;

const GameRulesModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="game-rules-modal">
      <h2>Règles du jeu</h2>
      <div className="game-rules-content">{renderFormattedText(rulesText)}</div>
    </div>
  </Modal>
);

export default GameRulesModal;
