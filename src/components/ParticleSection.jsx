import React, { useEffect, useRef } from "react";
import Experience from "../Experience/Experience.js";

const ParticleSection = ({ style, className }) => {
  const canvasRef = useRef(null);
  const experienceRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !experienceRef.current) {
      experienceRef.current = new Experience(canvasRef.current);
    }

    return () => {
      if (experienceRef.current) {
        experienceRef.current.destroy();
        experienceRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`webgl ${className || ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        outline: "2px solid blue",
        zIndex: -100,
        width: "100%",
        height: "100%",
        pointerEvents: "none", // Allow clicks to pass through if needed
        ...style,
      }}
    />
  );
};

export default ParticleSection;
