import React from "react";

/**
 * Formate du texte brut contenant des sauts de ligne en JSX.
 * - Deux sauts de ligne (\n\n ou plus) = nouveau paragraphe (<p>)
 * - Un seul saut de ligne (\n) = retour à la ligne (<br />)
 *
 * @param {string} text - Le texte brut à formater
 * @returns {JSX.Element[]} - Un tableau de paragraphes formatés en JSX
 */
export const renderFormattedText = (text) => {
  if (!text) return [];

  return text
    .split(/\n{2,}/) // paragraphes
    .map((paragraph, index) => (
      <p key={index}>
        {paragraph.split("\n").reduce((acc, line, i) => {
          return i === 0 ? [line] : [...acc, <br key={i} />, line];
        }, [])}
      </p>
    ));
};

export default renderFormattedText;
