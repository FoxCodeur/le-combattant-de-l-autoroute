/**
 * Utilitaires pour charger les chapitres et les fiches personnage du jeu.
 * Chaque fonction tente de récupérer un fichier JSON dans le dossier /Data/chapitres/.
 * La gestion d'erreur est soignée pour afficher un message clair à
 * l'utilisateur.
 */

/**
 * Récupère les données d'un chapitre à partir de son identifiant.
 * @param {string|number} id - L'identifiant du chapitre à charger.
 * @returns {Promise<Object>} - Les données du chapitre au format objet.
 * @throws {Error} - En cas d'erreur réseau, de ressource manquante,
 * ou de JSON corrompu.
 */
export async function fetchChapterById(id) {
  let response;
  try {
    // On tente de récupérer le fichier JSON correspondant au chapitre demandé
    response = await fetch(`/Data/chapitres/${id}.json`);
  } catch {
    // Si la requête échoue (ex : pas de connexion), on signale une
    // erreur réseau
    throw new Error("Impossible de se connecter au serveur.");
  }

  // Si le serveur répond mais avec un code d'erreur HTTP (ex: 404),
  // on l'indique à l'utilisateur
  if (!response.ok) {
    throw new Error(`Chapitre introuvable (code ${response.status})`);
  }

  try {
    // On tente de parser le contenu JSON du fichier
    return await response.json();
  } catch {
    // Si le fichier n'est pas un JSON valide (ex: fichier manquant,
    // HTML à la place), on affiche un message adapté
    throw new Error("Le chapitre demandé est introuvable ou endommagé.");
  }
}

/**
 * Récupère les données de la fiche d'un personnage à partir de son nom.
 * @param {string} characterName - Le nom du personnage à charger.
 * @returns {Promise<Object>} - Les données de la fiche personnage au
 * format objet.
 * @throws {Error} - En cas d'erreur réseau, de ressource manquante,
 * ou de JSON corrompu.
 */
export async function fetchCharacterData(characterName) {
  const fileName = `CharacterData${characterName}.json`;
  let response;
  try {
    // On tente de récupérer le fichier JSON correspondant à la fiche du personnage
    response = await fetch(`/Data/chapitres/${fileName}`);
  } catch {
    // Erreur réseau (connexion impossible, etc.)
    throw new Error("Impossible de se connecter au serveur.");
  }

  // Si le serveur répond mais le fichier n'existe pas, on l'indique à l'utilisateur
  if (!response.ok) {
    throw new Error(`Fiche personnage introuvable (code ${response.status})`);
  }

  try {
    // On tente de parser le contenu JSON du fichier
    return await response.json();
  } catch {
    // Si le JSON est corrompu ou le serveur renvoie un contenu inattendu
    throw new Error("La fiche personnage est introuvable ou endommagée.");
  }
}
