import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./GameOverModal.scss";

const GameOverModal = ({ visible, onNewGame }) => {
  const imgRef = useRef();

  useEffect(() => {
    if (visible && imgRef.current) {
      gsap.set(imgRef.current, { scale: 0.7, opacity: 0 });
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
      <div className="gameover-content">
        <img
          ref={imgRef}
          src="/images/GameOver.png"
          alt="Game Over"
          className="gameover-image"
        />
        {onNewGame && (
          <button className="gameover-newgame-btn" onClick={onNewGame}>
            Nouvelle partie
          </button>
        )}
      </div>
    </div>
  );
};

export default GameOverModal;
