import "./Nav.scss";
import { useState } from "react"; // Import du hook useState pour gérer
// l'état local du composant.
import { NavLink, useLocation } from "react-router-dom"; // Import de NavLink
// pour les liens de navigation et useLocation pour obtenir des informations
// sur l'URL actuelle.
import HamburgerButton from "../HamburgerButton/HamburgerButton";
import Logo from "./logo/Logo";
import HomeNav from "../../pages/home/homenav/HomeNav";

const Nav = () => {
  // Déclaration de l'état showLinks, qui détermine si le menu de navigation
  // (liens) est visible ou non. Initialisé à "false" pour indiquer que le menu
  // est fermé par défaut.
  const [showLinks, setshowLinks] = useState(false);

  // Utilisation de useLocation pour obtenir l'URL actuelle. Cela sera utilisé
  // pour afficher un sous-menu spécifique sur la page d'accueil.
  const location = useLocation();
  // Cette fonction bascule l'état showLinks entre "true" et "false".
  // Lorsqu'elle est appelée, elle inverse l'état actuel de showLinks ce qui
  // permet d'afficher ou masquer les liens.
  const handleShowLinks = () => {
    setshowLinks(!showLinks);
  };
  // Cette fonction force la fermeture du menu lorsque l'utilisateur clique sur
  // un lien de navigation. Elle définit l'état showLinks à "false", fermant
  // ainsi le menu.
  const handleLinkClick = () => {
    setshowLinks(false);
  };

  return (
    // La classe "navbar" change dynamiquement en fonction de l'état showLinks.
    // Si showLinks est "true", "show-nav" est ajouté pour afficher le menu.
    //il s'agit d'un opérateur ternaire. (if else sur une ligne.)
    <nav className={`navbar ${showLinks ? "show-nav" : ""}`}>
      {/* Conteneur principal pour le contenu de la barre de navigation. */}
      <div className="navbar_content">
        {/* Zone du logo, qui affiche le composant Logo importé. */}
        <div className="navbar_logo">
          <Logo />
        </div>

        {/* Liste des liens de navigation. Chaque lien utilise NavLink pour changer la route sans recharger la page. */}
        <ul className="navbar_links">
          {/* Chaque lien utilise la classe "navbar_link" et une animation CSS "slideInDown-X". 
              Lorsque l'utilisateur clique sur un lien, handleLinkClick est déclenché pour fermer le menu. */}
          <li className="navbar_item">
            <NavLink
              to="/"
              className="navbar_link slideInDown-1"
              onClick={handleLinkClick} // Ferme le menu lorsque ce lien est cliqué.
            >
              Logan's_Run
            </NavLink>

            <NavLink
              to="/lexique"
              className="navbar_link slideInDown-2" // Animation pour le deuxième lien.
              onClick={handleLinkClick}
            >
              Lexique
            </NavLink>

            <NavLink
              to="/timelines"
              className="navbar_link slideInDown-3" // Animation pour le troisième lien.
              onClick={handleLinkClick}
            >
              Timelines
            </NavLink>

            <NavLink
              to="/games"
              className="navbar_link slideInDown-4" // Animation pour le quatrième lien.
              onClick={handleLinkClick}
            >
              Games
            </NavLink>

            <NavLink
              to="/portfolio"
              className="navbar_link slideInDown-4" // Même animation que le lien précédent.
              onClick={handleLinkClick}
            >
              Portfolio
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Affiche HomeNav uniquement si l'utilisateur se trouve sur la page d'accueil ("/"). */}
      <div className="home_nav_container">
        {location.pathname === "/" && <HomeNav />}
      </div>

      {/* Bouton hamburger pour les petits écrans. Il affiche ou cache le menu quand on clique dessus. 
          Le composant HamburgerButton reçoit l'état ouvert (showLinks) pour ajuster son apparence. */}
      <button
        className="navbar_burger"
        type="button"
        onClick={handleShowLinks}
        aria-label="Ouvrir ou fermer le menu de navigation"
        aria-expanded={showLinks}
        aria-controls="menu-navigation"
      >
        <HamburgerButton opened={showLinks} />
      </button>
    </nav>
  );
};

export default Nav; // Export du composant Nav pour être utilisé ailleurs dans l'application.
