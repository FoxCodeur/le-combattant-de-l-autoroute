// src/routes/routesConfig.jsx
import Chapter from "../components/Chapter/Chapter";
import Home from "../pages/home/Home";

const routesConfig = [
  {
    path: "/",
    element: Home, // Juste la référence du composant, pas de JSX ici
  },
  {
    path: "/chapitre/:id", // Route dynamique
    element: Chapter, // Juste la référence du composant, pas de JSX ici
  },
];

export default routesConfig;
