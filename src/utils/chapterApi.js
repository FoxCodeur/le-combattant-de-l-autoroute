// Utilitaires pour charger chapitres et fiches personnages

export async function fetchChapterById(id) {
  const response = await fetch(`/Data/chapitres/${id}.json`);
  if (!response.ok)
    throw new Error(`Chapitre introuvable (code ${response.status})`);
  return await response.json();
}

export async function fetchCharacterData(characterName) {
  const fileName = `CharacterData${characterName}.json`;
  const response = await fetch(`/Data/chapitres/${fileName}`);
  if (!response.ok)
    throw new Error(`Fiche personnage introuvable (code ${response.status})`);
  return await response.json();
}
