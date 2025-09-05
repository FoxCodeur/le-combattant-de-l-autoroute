import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";
import logo from "../../assets/images/logo.webp";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => (
  <footer className="footer">
    <div className="footer__section footer__logo">
      <Link to="/" aria-label="Accueil">
        <img src={logo} alt="Logo Le Combattant de l'Autoroute" />
      </Link>
    </div>
    <div className="footer__section footer__center">
      <Link to="/mentions-legales">Mentions légales</Link>
    </div>
    <div className="footer__section footer__socials">
      <a
        href="https://www.linkedin.com/in/jean-luc-detcherry-04388018/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <FaLinkedin />
      </a>
      <a
        href="https://github.com/FoxCodeur"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        <FaGithub />
      </a>
    </div>
  </footer>
);

export default Footer;
