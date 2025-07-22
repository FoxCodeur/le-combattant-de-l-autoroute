import React, { useEffect, useMemo, useRef } from "react";
import Modal from "../Modal/Modal";
import "./VehiculeModal.scss";
import { gsap } from "gsap";

const blocks = [
  { text: "Modèle : Ford Falcon", style: { top: "1%", left: "1%" } },
  {
    text: "Moteur : V8, avec kit supercharger",
    style: { bottom: "1%", right: "1%" },
  },
];

const VehiculeModal = ({ isOpen, onClose, vehicleImage }) => {
  // useMemo ensures stability of the refs array between renders
  const blockRefs = useMemo(() => blocks.map(() => React.createRef()), []);
  const typingTimeouts = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      blockRefs.forEach((ref) => {
        if (ref.current) ref.current.innerText = "";
      });
      typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeouts.current = [];
      return;
    }

    const typeWriter = (ref, fullText, delay = 0, speed = 30) => {
      let i = 0;
      const write = () => {
        if (ref.current) {
          ref.current.innerText = fullText.slice(0, i);
          if (i <= fullText.length) {
            i++;
            typingTimeouts.current.push(setTimeout(write, speed));
          }
        }
      };
      typingTimeouts.current.push(setTimeout(write, delay));
    };

    blockRefs.forEach((ref, idx) => {
      gsap.set(ref.current, { opacity: 0 });
      gsap.to(ref.current, {
        opacity: 1,
        delay: idx * 0.7,
        duration: 0.5,
      });
    });

    let totalDelay = 0;
    blocks.forEach((block, idx) => {
      typeWriter(blockRefs[idx], block.text, totalDelay, 30);
      totalDelay += block.text.length * 30 + 300;
    });

    return () => {
      typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeouts.current = [];
      blockRefs.forEach((ref) => {
        if (ref.current) ref.current.innerText = "";
        gsap.set(ref.current, { opacity: 0 });
      });
    };
  }, [isOpen, blockRefs]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="vehicule-modal">
        <div className="vehicule-content" style={{ position: "relative" }}>
          <img
            src={vehicleImage}
            alt="Interceptor"
            className="vehicule-image"
          />
          {blocks.map((block, idx) => (
            <div
              key={idx}
              ref={blockRefs[idx]}
              className="vehicule-block"
              style={{
                position: "absolute",
                ...block.style,
              }}
            ></div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default VehiculeModal;
