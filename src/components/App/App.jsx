import React from "react";
import { Route, Routes } from "react-router-dom";
import routesConfig from "../../config/routesConfig"; // Assurez-vous que ce chemin est correct
import "./App.scss";

const App = () => {
  return (
    <div>
      <Routes>
        {routesConfig.map((route, index) => (
          <Route key={index} path={route.path} element={<route.element />} />
        ))}
      </Routes>
    </div>
  );
};

export default App;
