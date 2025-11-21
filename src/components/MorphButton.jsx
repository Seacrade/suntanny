import React, { useState } from "react";

const MorphButton = () => {
  const [morphState, setMorphState] = useState(0); // 0: Sphere, 1: Cube, 2: Yin Yang, 3: Torus, 4: DNA, 5: Heart

  const toggleMorph = () => {
    const newState = (morphState + 1) % 6;
    setMorphState(newState);
    if (window.experience && window.experience.world && window.experience.world.page) {
      window.experience.world.page.morph(newState);
    }
  };

  const getLabel = () => {
    switch (morphState) {
      case 0: return "Sphere";
      case 1: return "Cube";
      case 2: return "Yin Yang";
      case 3: return "Torus";
      case 4: return "DNA";
      case 5: return "Heart";
      default: return "Sphere";
    }
  };

  return (
    <button
      onClick={toggleMorph}
      className="fixed top-32 left-10 z-50 px-6 py-2 text-white border border-white/30 rounded-full font-migha font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 pointer-events-auto backdrop-blur-sm"
    >
      {getLabel()}
    </button>
  );
};

export default MorphButton;
