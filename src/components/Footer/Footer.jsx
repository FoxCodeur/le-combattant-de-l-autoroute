import React from "react";
import "./Footer.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithubAlt, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import FoxCodeurLogo from "@/assets/images/images-générales/fox-codeur.png";
import renard from "@/assets/images/images-générales/renard.png";
import Logo from "../Nav/logo/Logo";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer_inside">
        <Logo />
        <img
          className="foxCodeurLogo"
          src={FoxCodeurLogo}
          alt=" illustration d'une tête de renard"
        />

        <div className="socials-container">
          <div className="github">
            <a
              href="https://github.com/FoxCodeur"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FontAwesomeIcon icon={faGithubAlt} className="socialsStyle" />
            </a>
          </div>
          <div className="linkedin">
            <a
              href="https://www.linkedin.com/in/jean-luc-detcherry-04388018/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} className="socialsStyle" />
            </a>
          </div>
          <div className="socialFox">
            <a
              href="https://ton-lien-perso-ou-autre-reseau.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FoxCodeur"
            >
              <img
                className="fox socialsStyle"
                src={renard}
                alt="nouvelle édition du roman Logan's run"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
