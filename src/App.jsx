import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Story from "./sections/Story";
import { LoadingScreen } from "./components/LoadingScreen";
import Dropdown from "./components/Dropdown";
import ParticleSection from "./components/ParticleSection";
import SplashScreen from "./components/SplashScreen";
import ScrollProgress from "./components/ScrollProgress";

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [storyStarted, setStoryStarted] = useState(false);
  const [storyEnded, setStoryEnded] = useState(false);
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
      particleSystem.morph(0, 2, "sine.inOut");

      // Animate to Story start state
      particleSystem.setAmplitude(200, 1.5, "sine.inOut");
      particleSystem.setColor("#000000", 0.2, "sine.inOut");
      particleSystem.setRotation(false);

      // Move camera to Story start position
      camera.animateCameraTo({ x: 0, y: 0, z: -150 }, 2, "sine.inOut");
    }

    // Animate Splash Out
    if (splashRef.current) {
      gsap.to(splashRef.current, {
        opacity: 0,
        duration: 2.2,
        ease: "sine.inOut",
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
        <div ref={splashRef} className="pointer-events-auto absolute inset-0 z-50">
          <SplashScreen onStart={handleStart} />
        </div>
      )}
      <ParticleSection className="fixed top-0 left-0 w-full h-full" />

      {storyStarted && (
        <>
          <ScrollProgress />
          {storyEnded && <Dropdown />}
          {/* Wrapper div to isolate GSAP pinning from React DOM operations */}
          <div className="w-full">
            <Story isReady={isReady} onStoryEnd={() => setStoryEnded(true)} />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
