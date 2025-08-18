import "./StatBox.scss"; // <-- Assure-toi que cette ligne existe

const StatBox = ({ label, value, valueClass }) => (
  <div className="stat-box">
    <span className="stat-box-label">{label}</span>
    <span className={`stat-box-value ${valueClass || ""}`}>{value}</span>
  </div>
);

export default StatBox;
