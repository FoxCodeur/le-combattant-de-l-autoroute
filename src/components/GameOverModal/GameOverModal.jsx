import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./GameOverModal.scss";

const GameOverModal = ({ visible }) => {
  const imgRef = useRef();

  useEffect(() => {
    if (visible && imgRef.current) {
      // Réinitialise l'état avant animation
      gsap.set(imgRef.current, { scale: 0.7, opacity: 0 });

      // Lance l'animation "zoom + fondu"
      gsap.to(imgRef.current, {
        scale: 1,
        opacity: 1,
        duration: 3,
        ease: "back.out(1.7)",
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="gameover-overlay">
      <img
        ref={imgRef}
        src="/images/GameOver.png"
        alt="Game Over"
        className="gameover-image"
      />
    </div>
  );
};

export default GameOverModal;
