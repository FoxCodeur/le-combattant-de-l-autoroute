import React from "react";
import "./VehicleItemStatus.css";

const VehicleItemStatus = ({ label, value, icon }) => (
  <div className="vehicle-item-status">
    <span className="tooltip">
      <img src={icon} alt={label} className="vehicle-item-icon" />
      <span className="tooltiptext">{label}</span>
    </span>
    <span className="vehicle-item-value">{value}</span>
  </div>
);

export default VehicleItemStatus;
