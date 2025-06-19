import PropTypes from "prop-types";
import "../Nav/Nav.scss";

const HamburgerButton = ({ opened }) => {
  return <span className={`burger-bar ${opened ? "opened" : ""}`}></span>;
};

HamburgerButton.propTypes = {
  opened: PropTypes.bool.isRequired,
};

export default HamburgerButton;
