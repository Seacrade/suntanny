import React from "react";

const SplashScreen = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center tracking-tighter">
        When the Silence Shattered
      </h1>
      <p className="text-xl md:text-2xl mb-12 text-center max-w-2xl opacity-80">
        A Tale of Chaos & Order
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 text-xl border border-white/30 hover:bg-white hover:text-black transition-all duration-300 rounded-full uppercase tracking-widest">
        Start Journey
      </button>
    </div>
  );
};

export default SplashScreen;
