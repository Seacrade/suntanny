import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Navbar from "./sections/Navbar";
import Story from "./sections/Story";
import { LoadingScreen } from "./components/LoadingScreen";
import Dropdown from "./components/Dropdown";
import ParticleSection from "./components/ParticleSection";
import SplashScreen from "./components/SplashScreen";

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [storyStarted, setStoryStarted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const splashRef = useRef(null);

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
    // Trigger 3D morph and initial animations immediately
    if (
      window.experience &&
      window.experience.world &&
      window.experience.world.page &&
      window.experience.world.page.particleSystem
    ) {
      const particleSystem = window.experience.world.page.particleSystem;
      const camera = window.experience.camera;

      // Morph to Sphere (0)
      particleSystem.morph(0, 3, "sine.inOut");

      // Animate to Story start state
      particleSystem.setAmplitude(1000, 2, "sine.inOut");
      particleSystem.setColor("#ffffff", 2, "sine.inOut");
      particleSystem.setRotation(true);

      // Move camera to Story start position
      camera.animateCameraTo({ x: 0, y: 0, z: -6000 }, 3, "power2.inOut");
    }

    // Animate Splash Out
    if (splashRef.current) {
      gsap.to(splashRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          setShowSplash(false);
          setStoryStarted(true); // Mount Story only after splash is gone to prevent layout shift
        },
      });
    } else {
      setShowSplash(false);
      setStoryStarted(true);
    }
  };

  return (
    <div className="relative w-full min-h-screen z-10 pointer-events-none">
      <LoadingScreen started={isReady} setStarted={setIsReady} />
      {isReady && showSplash && (
        <div
          ref={splashRef}
          className="pointer-events-auto absolute inset-0 z-50">
          <SplashScreen onStart={handleStart} />
        </div>
      )}
      <ParticleSection className="fixed top-0 left-0 w-full h-full" />

      {storyStarted && (
        <>
          {/* <Navbar />
          <Dropdown /> */}
          <Story isReady={isReady} />
        </>
      )}
    </div>
  );
};

export default App;
