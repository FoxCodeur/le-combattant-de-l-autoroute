// src/main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App/App.jsx";
import "./styles/index.scss";
import ChapterProvider from "./context/ChapterProvider"; // Importer sans accolades

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <ChapterProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </ChapterProvider>
  </StrictMode>
);
