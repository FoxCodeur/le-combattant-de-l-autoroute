export default function applyNarrativeModifiers(modifiers, characterData) {
  if (!modifiers || !characterData)
    return { character: characterData, changes: [] };

  const updatedCharacter = JSON.parse(JSON.stringify(characterData));
  const sections = [
    "caractéristiques",
    "équipement",
    "accessoires",
    "interceptor",
  ];
  const changes = [];

  Object.entries(modifiers).forEach(([key, value]) => {
    for (const section of sections) {
      if (
        updatedCharacter[section] &&
        typeof updatedCharacter[section][key] !== "undefined"
      ) {
        if (typeof updatedCharacter[section][key] === "number") {
          const before = updatedCharacter[section][key];
          updatedCharacter[section][key] = Math.max(0, before + value);
          if (value !== 0) {
            // Ajoute à la liste des changements si le score a changé
            changes.push({
              type: key,
              value,
              old: before,
              new: updatedCharacter[section][key],
            });
          }
        }
        break;
      }
    }
  });
  return { character: updatedCharacter, changes };
}
