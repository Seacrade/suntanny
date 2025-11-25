import React, { useState, useEffect, useRef } from "react";

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  const [showProposal, setShowProposal] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 0, label: "Sphere" },
    { value: 1, label: "Cube" },
    { value: 2, label: "Yin Yang" },
    { value: 3, label: "Torus" },
    { value: 5, label: "Heart" },
  ];

  const handleSelect = (value) => {
    setSelectedOption(value);
    setIsOpen(false);
    if (window.experience && window.experience.world && window.experience.world.page) {
      window.experience.world.page.morph(value);
    }
    if (value === 5) {
      setShowProposal(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentLabel = options.find((opt) => opt.value === selectedOption)?.label || "Sphere";

  return (
    <div className="fixed top-12 left-10 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-2 text-white border border-white/30 rounded-full font-migha font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 pointer-events-auto backdrop-blur-sm flex items-center gap-2 min-w-[160px] justify-between">
        <span>{currentLabel}</span>
        <span
          className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-black/80 border border-white/20 rounded-xl overflow-hidden backdrop-blur-md pointer-events-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-6 py-3 text-sm font-migha uppercase tracking-wider transition-colors duration-200 ${
                selectedOption === option.value
                  ? "bg-white text-black"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}>
              {option.label}
            </button>
          ))}
        </div>
      )}

      {showProposal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[100] backdrop-blur-sm pointer-events-auto">
          <div className="bg-white p-8 rounded-2xl text-center space-y-6 max-w-md mx-4 animate-in fade-in zoom-in duration-300">
            <p className="text-black text-2xl font-bold font-serif">
              hi tanny, would you like to go to polyball with me?
            </p>
            <button
              onClick={() => setShowProposal(false)}
              className="px-8 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-colors shadow-lg hover:scale-105 transform duration-200">
              yes please onichan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
