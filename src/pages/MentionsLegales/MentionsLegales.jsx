import React from "react";
import { useNavigate } from "react-router-dom";
import "./MentionsLegales.scss";

const MentionsLegales = () => {
  const navigate = useNavigate();

  return (
    <div className="mentions-legales">
      <button
        className="mentions-legales__back-btn"
        onClick={() => navigate(-1)}
      >
        ← Revenir à la page précédente
      </button>
      <h1>Mentions légales</h1>
      <section>
        <h2>Éditeur du site</h2>
        <p>
          <strong>Nom du site :</strong> Les Seigneurs de la route
          <br />
          <strong>Responsable de publication :</strong> Detcherry
          <br />
          <strong>Contact :</strong> detcherry@gmail.com
        </p>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>
          <strong>Hébergeur :</strong> Vercel
          <br />
          <br />
        </p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Le contenu de ce site (textes, images, graphismes, logo, icônes, sons,
          logiciels, etc.) est protégé par les lois en vigueur sur la propriété
          intellectuelle et est la propriété exclusive de Detcherry Jean-Luc.
        </p>
      </section>
      <section>
        <h2>Données personnelles</h2>
        <p>
          Les informations recueillies via ce site sont utilisées uniquement
          dans le cadre du projet « Les Seigneurs de la route » et ne sont
          jamais transmises à des tiers sans votre consentement.
        </p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>
          Ce site ne dépose aucun cookie de suivi ou d’analyse et ne collecte
          aucune donnée personnelle. Il est possible que l’hébergeur (Vercel)
          utilise des cookies strictement techniques nécessaires au bon
          fonctionnement du site, mais aucune information personnelle n’est
          enregistrée ou exploitée par l’éditeur du site.
        </p>
        <p>
          Afin de sauvegarder votre progression dans le jeu, ce site utilise le
          stockage local de votre navigateur. Aucune donnée n’est transmise à
          l’éditeur du site ou à des tiers. Ces informations restent strictement
          sur votre appareil et vous pouvez les supprimer à tout moment via les
          paramètres de votre navigateur.
        </p>
      </section>
      <section>
        <h2>Limitation de responsabilité</h2>
        <p>
          Detcherry Jean-Luc ne saurait être tenu responsable des erreurs
          rencontrées sur le site, de problèmes techniques, d’interprétation des
          informations publiées et des conséquences de leur utilisation.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Pour toute question concernant les mentions légales du site, vous
          pouvez me contacter à l’adresse suivante : detcherry@gmail.com
        </p>
      </section>
    </div>
  );
};

export default MentionsLegales;
