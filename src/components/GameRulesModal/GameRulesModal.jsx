import React from "react";
import Modal from "../Modal/Modal";
import renderFormattedText from "../../utils/renderFormattedText";
import "./GameRulesModal.scss";

// Texte des règles du jeu, enrichi avec l'explication de Brocéliande Editions
const rulesText = `

Dans un roman classique, vous suivez les aventures d’un héros, sans avoir la moindre influence sur le déroulement de l'aventure. Ici, **c’est VOUS qui avez votre destin en main**.

La lecture est interactive. Parfois, vous devrez recommencer l’aventure depuis le début, même sans être arrivé(e) à la fin ! La mort signifie l’échec de votre mission : c’est le “game over” du livre-jeu. Vous devez donc survivre pour connaître la suite de l’histoire !

Un livre dont vous êtes le héros est donc à la fois un roman et un jeu.

Bienvenue dans *Le Combattant de l’Autoroute* !

---

### Les caractéristiques du personnage sélectionné

- **Endurance** : La vitalité du héros : si celle-ci tombe à zéro, ce dernier meurt.
- **Habileté** : Capacité de chaque individu à concrétiser des actions qui demandent de la précision.
- **Chance** : La faculté d’échapper aux dangers ou de profiter d’un coup du sort, mise à l’épreuve lors des situations incertaines.

### Caractéristiques du véhicule

- **Blindage** : L’armature et les renforts de ton véhicule constituent son blindage. À chaque dommage subi, il diminue : s’il atteint zéro, c'est la fin de l'aventure.
- **Puissance de feu** : Indique la force de frappe du véhicule lors des combats.

### Lancers de dés

- **Déroulement de l'épreuve** : Clique sur le bouton lancer les dés lorsque le jeu l'exige : test de hasard, chance, habileté, modificateur narratif.
- Les tests de chance ou d’habileté interviennent lors de situations à risque ou d’actions particulières.

### Choix & Objets

- Certains choix nécessitent l'obtention d'objets.
- Les conséquences d'une décision prise peuvent affecter tes caractéristiques ou ton équipement. (ajout, retrait d'objet, points d'endurance, blindage...)

---

## Systèmes de Combat

### Combat Rapproché

Affrontements sans armes à feu ni projectiles (mains nues ou armes de type batte de base-ball, couteau).

**Déroulement :**
1. Lance deux dés et ajoute le total à ton score d’HABILETÉ : c’est ta Force d’Attaque.
2. Lance ensuite deux dés et ajoute le total au score d’HABILETÉ de ton adversaire : c’est sa Force d’Attaque. (action réalisée par l'IA)
3. Comparez :
   - Si la Force d’Attaque de l’adversaire > la tienne : tu es blessé.
   - Si la tienne > celle de l’adversaire : tu lui causes des dommages corporels.
   - Si égalité : aucun coup porté, recommence à l’étape 1.
4. Un coup réussi inflige une blessure :
   - À mains nues : perte de 1 point d’ENDURANCE pour le perdant.
   - Avec arme de choc : 2 points (couteau, batte de base-ball).
5. Reprise du combat à l’étape 1 jusqu’à ce que l’un des adversaires ait perdu tous ses points d’ENDURANCE.
6. Si ton ENDURANCE tombe à zéro, tu es mort.

---

### Tir

Affrontements avec armes à feu, armes de jet ou arbalètes.

**Déroulement :**
1. Lance deux dés et ajoute le total aux points d’HABILETÉ de l’adversaire : c’est sa Force d’Attaque.
2. Lance ensuite deux dés et ajoute le total au score d’HABILETÉ de ton adversaire : c’est sa Force d’Attaque. (action réalisée par l'IA)
3. Comparaison :
   - Si la Force d’Attaque de l’adversaire > la tienne : tu es touché.
   - Si la tienne > celle de l’adversaire : tu le touches.
   - Si égalité : aucun tir réussi, recommence à l’étape 1.
4. Un tir réussi inflige une blessure :
   - 2 points d’ENDURANCE sont déduis.

---

### Combat Motorisé

Affrontements entre véhicules équipés d’armes.

**Déroulement :**
1. Lance deux dés et ajoute le total aux points de puissance de feu du véhicule adverse : c’est sa Force d’Attaque.
2. Lance deux dés et ajoute le total à la puissance de feu de ton véhicule : c’est ta Force d’Attaque.
3. Comparaison :
   - Si la Force d’Attaque de l’adversaire > la tienne : ton véhicule est touché.
   - Si la tienne > celle de l’adversaire : tu endommages son véhicule.
   - Si égalité : aucune attaque réussie, recommence à l’étape 1.
4. Une attaque réussie inflige des dommages :
   - 2 points de BLINDAGE du véhicule touché.
5. Reprends le combat à l’étape 1 jusqu’à ce que le BLINDAGE de l’un des véhicules tombe à zéro (destruction du véhicule et mort du conducteur).
6. Utilisation des roquettes : Une roquette détruit automatiquement la cible. Rayez une roquette après chaque utilisation.

---

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
