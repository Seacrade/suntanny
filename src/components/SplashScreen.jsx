import React from "react";

const SplashScreen = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm">
      <h1 className="text-6xl md:text-9xl font-bold mb-8 text-center tracking-tighter">
        The Furnace Heart
      </h1>
      <p className="text-xl md:text-2xl mb-12 text-center max-w-2xl opacity-80">
        A story of Chaos and Order
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 text-xl border border-white/30 hover:bg-white hover:text-black transition-all duration-300 rounded-full uppercase tracking-widest">
        Start Story
      </button>
    </div>
  );
};

export default SplashScreen;
