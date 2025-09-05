import React from "react";
import { Route, Routes } from "react-router-dom";
import routesConfig from "../../config/routesConfig";
import Footer from "../Footer/Footer";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import ScrollToTopButton from "../ScrollToTopButton/ScrollToTopButton";
import "./App.scss";

const App = () => {
  return (
    <div className="app-container">
      <ScrollToTop /> {/* Scroll auto à chaque navigation */}
      <Routes>
        {routesConfig.map((route, index) => (
          <Route key={index} path={route.path} element={<route.element />} />
        ))}
      </Routes>
      <ScrollToTopButton /> {/* Bouton flottant pour l'utilisateur */}
      <Footer />
    </div>
  );
};

export default App;
