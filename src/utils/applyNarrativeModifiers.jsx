export default function applyNarrativeModifiers(modifiers, characterData) {
  if (!modifiers || !characterData) return characterData;
  const updatedCharacter = JSON.parse(JSON.stringify(characterData));
  const sections = [
    "caractéristiques",
    "équipement",
    "accessoires",
    "interceptor",
  ];
  Object.entries(modifiers).forEach(([key, value]) => {
    for (const section of sections) {
      if (
        updatedCharacter[section] &&
        typeof updatedCharacter[section][key] !== "undefined"
      ) {
        if (typeof updatedCharacter[section][key] === "number") {
          updatedCharacter[section][key] = Math.max(
            0,
            updatedCharacter[section][key] + value
          );
        }
        break;
      }
    }
  });
  return updatedCharacter;
}
