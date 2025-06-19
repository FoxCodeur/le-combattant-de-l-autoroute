import React from "react";
import logo from "@/assets/images/images-générales/logantitle.png";
import "./Logo.scss";

const Logo = () => {
  return (
    <div className="logo">
      <h1>
        <img className="widthLogo" src={logo} alt="Logan's run" />
      </h1>
    </div>
  );
};

export default Logo;
