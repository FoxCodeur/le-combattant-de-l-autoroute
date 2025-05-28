import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App/App.jsx";
import "./styles/index.scss";
import ChapterProvider from "./context/ChapterProvider";
import TestProvider from "./context/TestProvider";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <ChapterProvider>
      <TestProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
      </TestProvider>
    </ChapterProvider>
  </StrictMode>
);
