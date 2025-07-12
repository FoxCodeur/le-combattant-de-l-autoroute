/**
 * Applique des modificateurs narratifs à un personnage donné et retourne
 * le personnage modifié ainsi que la liste des changements effectués.
 *
 * @param {Object} modifiers - Un objet contenant les modificateurs (clé: nom du champ, valeur: modification à appliquer)
 * @param {Object} characterData - Les données du personnage à modifier
 * @returns {Object} Un objet contenant :
 *    - character : le personnage modifié
 *    - changes : la liste des modifications effectuées
 */
export default function applyNarrativeModifiers(modifiers, characterData) {
  // Si aucun modificateur ou aucune donnée de personnage, retourne
  //  l'original sans changements
  if (!modifiers || !characterData)
    return { character: characterData, changes: [] };

  // Clone les données du personnage pour ne pas modifier l'objet
  //  original
  const updatedCharacter = JSON.parse(JSON.stringify(characterData));

  // Liste des sections du personnage à parcourir pour appliquer les modificateurs
  const sections = [
    "caractéristiques", // statistiques de base (ex: force, intelligence, etc)
    "équipement", // équipements portés par le personnage
    "accessoires", // accessoires supplémentaires
    "interceptor", // véhicule ou item spécial, par exemple
  ];

  // Liste qui contiendra l'historique des changements apportés
  const changes = [];

  // Parcours chaque modificateur à appliquer
  Object.entries(modifiers).forEach(([key, value]) => {
    // Pour chaque section, tente d'appliquer le modificateur
    for (const section of sections) {
      // Vérifie si la section existe et si la propriété à modifier existe dans cette section
      if (
        updatedCharacter[section] &&
        typeof updatedCharacter[section][key] !== "undefined"
      ) {
        // Si la propriété à modifier est de type nombre
        if (typeof updatedCharacter[section][key] === "number") {
          const before = updatedCharacter[section][key]; // Valeur avant modification
          // Applique le modificateur, sans descendre sous 0
          updatedCharacter[section][key] = Math.max(0, before + value);

          if (value !== 0) {
            // Ajoute à la liste des changements si la valeur a changé
            changes.push({
              type: key, // Nom du champ modifié
              value, // Valeur du modificateur
              old: before, // Ancienne valeur
              new: updatedCharacter[section][key], // Nouvelle valeur
            });
          }
        }
        // Une fois le modificateur appliqué dans la bonne section, passe au suivant
        break;
      }
    }
  });

  // Retourne le personnage modifié et la liste des changements
  return { character: updatedCharacter, changes };
}
