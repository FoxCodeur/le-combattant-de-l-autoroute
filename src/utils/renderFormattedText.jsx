import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Liste des styles personnalisés reconnus
const STYLE_TAGS = ["highlight", "danger", "info", "success", "payment"];

const renderFormattedText = (text) => {
  if (!text) return null;

  let formattedText = text;
  // Remplace toutes les balises personnalisées par un <span> avec la bonne classe
  STYLE_TAGS.forEach((tag) => {
    const regex = new RegExp(`\\[${tag}\\](.*?)\\[\\/${tag}\\]`, "gs");
    formattedText = formattedText.replace(
      regex,
      `<span class="${tag}-text">$1</span>`
    );
  });

  // Configure marked pour gérer les sauts de ligne comme des <br>
  marked.setOptions({
    breaks: true,
  });

  const rawHtml = marked.parse(formattedText);
  // Autorise les classes sur les balises span
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_CLASSES: { span: STYLE_TAGS.map((tag) => `${tag}-text`) },
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};

export default renderFormattedText;
