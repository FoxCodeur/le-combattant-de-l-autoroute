import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

const renderFormattedText = (text) => {
  if (!text) return null;

  // Configure marked pour gérer les sauts de ligne comme des <br>
  marked.setOptions({
    breaks: true,
  });

  const rawHtml = marked.parse(text);
  const cleanHtml = DOMPurify.sanitize(rawHtml);

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};

export default renderFormattedText;
