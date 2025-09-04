// Import des fonctions nécessaires du SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Ta configuration (copie-colle celle de la console)
const firebaseConfig = {
  apiKey: "AIzaSyCrx1IPZXayRWT2vT1Klon-LwxTmX-1UCz8",
  authDomain: "livre-jeu-compteur.firebaseapp.com",
  projectId: "livre-jeu-compteur",
  storageBucket: "livre-jeu-compteur.appspot.com",
  messagingSenderId: "915277700412",
  appId: "1:915277700412:web:bed96bb5621df7e2539",
  measurementId: "G-GNXX8W9TYC",
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export de Firestore pour utilisation dans l'app
export const db = getFirestore(app);
