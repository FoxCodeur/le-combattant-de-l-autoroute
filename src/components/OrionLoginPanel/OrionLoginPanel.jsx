import React, { useState } from "react";
import "./OrionLoginPanel.scss";

const OrionLoginPanel = ({ onLogin }) => {
  const [value, setValue] = useState("");
  return (
    <div className="orion-login-panel">
      <div className="orion-login-title">AUTHENTICATION</div>
      <input
        type="text" // ou "password" si tu veux masquer la saisie
        className="orion-login-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        name="authcode" // ← Ajouté
        id="authcode" // ← Ajouté (optionnel mais conseillé)
        placeholder="mot de passe"
        autoComplete="off"
        autoFocus
      />
      <button className="orion-login-btn" onClick={() => onLogin(value)}>
        LOGIN
      </button>
    </div>
  );
};
export default OrionLoginPanel;
