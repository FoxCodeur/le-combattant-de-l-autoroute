import Chapter from "../pages/Chapter/Chapter";
import Home from "../pages/home/Home";
import MentionsLegales from "../pages/MentionsLegales/MentionsLegales";

const routesConfig = [
  {
    path: "/",
    element: Home,
  },
  {
    path: "/chapitre/:id",
    element: Chapter,
  },
  {
    path: "/mentions-legales",
    element: MentionsLegales,
  },
];

export default routesConfig;
