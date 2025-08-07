export function isChoiceAvailable(choice, characterData) {
  if (!choice.condition) return true;

  // Gestion des objets (inventaire, équipements, accessoires, interceptor)
  if (choice.condition.item) {
    const normalized = (str) => str.replace(/_/g, "").toLowerCase();
    let count = 0;
    const containers = [
      "inventaire",
      "équipement",
      "accessoires",
      "interceptor",
    ];
    containers.forEach((container) => {
      if (characterData?.[container]) {
        const obj = characterData[container];
        if (Array.isArray(obj)) {
          obj.forEach((item) => {
            if (typeof item === "string") {
              if (normalized(item) === normalized(choice.condition.item))
                count++;
            } else if (
              item.nom &&
              normalized(item.nom) === normalized(choice.condition.item)
            ) {
              count += item.quantite ? item.quantite : 1;
            }
          });
        } else if (typeof obj === "object") {
          Object.entries(obj).forEach(([key, value]) => {
            if (normalized(key) === normalized(choice.condition.item)) {
              count += value;
            }
          });
        }
      }
    });
    const hasItem = count > 0;
    return choice.condition.hasItem ? hasItem : !hasItem;
  }

  // Gestion des statistiques (ex: endurance, habileté...)
  if (
    choice.condition.stat &&
    choice.condition.operator &&
    typeof choice.condition.value === "number"
  ) {
    const statKey = choice.condition.stat;
    let statValue =
      characterData?.caractéristiques?.[statKey] ??
      characterData?.interceptor?.[statKey] ??
      characterData?.[statKey];

    if (typeof statValue !== "number") return false;

    switch (choice.condition.operator) {
      case ">=":
        return statValue >= choice.condition.value;
      case "<=":
        return statValue <= choice.condition.value;
      case ">":
        return statValue > choice.condition.value;
      case "<":
        return statValue < choice.condition.value;
      case "==":
      case "=":
        return statValue === choice.condition.value;
      case "!=":
        return statValue !== choice.condition.value;
      default:
        return false;
    }
  }

  return true;
}
