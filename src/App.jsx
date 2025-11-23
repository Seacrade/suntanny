import React, { useState, useEffect } from "react";
import Navbar from "./sections/Navbar";
import Story from "./sections/Story";
import { LoadingScreen } from "./components/LoadingScreen";
import Dropdown from "./components/Dropdown";
import ParticleSection from "./components/ParticleSection";
import SplashScreen from "./components/SplashScreen";

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [storyStarted, setStoryStarted] = useState(false);

  useEffect(() => {
    const checkExperience = setInterval(() => {
      if (window.experience && window.experience.resources) {
        clearInterval(checkExperience);

        if (window.experience.resources.loadedAll) {
          setIsReady(true);
        } else {
          window.experience.resources.on("ready", () => {
            setIsReady(true);
          });
        }
      }
    }, 100);

    return () => clearInterval(checkExperience);
  }, []);

  const handleStart = () => {
    setStoryStarted(true);
    if (
      window.experience &&
      window.experience.world &&
      window.experience.world.page &&
      window.experience.world.page.particleSystem
    ) {
      window.experience.world.page.particleSystem.morph(0, 3, "sine.inOut");
    }
  };

  return (
    <div className="relative w-full min-h-screen z-10 pointer-events-none">
      <LoadingScreen started={isReady} setStarted={setIsReady} />
      {isReady && !storyStarted && (
        <div className="pointer-events-auto">
          <SplashScreen onStart={handleStart} />
        </div>
      )}
      <ParticleSection className="fixed top-0 left-0 w-full h-full" />

      {storyStarted && (
        <>
          <Navbar />
          <Dropdown />
          <Story isReady={isReady} />
        </>
      )}
    </div>
  );
};

export default App;
