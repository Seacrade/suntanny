import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import ParallaxText from "../components/ParallaxText";

gsap.registerPlugin(ScrollTrigger);

const Slide = ({ children, className, id }) => (
  <div
    id={id}
    className={`absolute inset-0 flex p-8 md:p-20 opacity-0 pointer-events-none ${className}`}>
    <div className="max-w-4xl">{children}</div>
  </div>
);

const Story = ({ isReady }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (!isReady) return;

    const ctx = gsap.context(() => {
      const experience = window.experience;
      if (!experience || !experience.world || !experience.world.page) return;

      const particleSystem = experience.world.page.particleSystem;
      const camera = experience.camera;
      const cam = camera.instance;

      // 1. Capture current state from the engine to ensure seamless transition
      const currentAmplitude =
        particleSystem.simulationShader.uniforms.amplitude.value;
      const currentColor =
        particleSystem.renderShader.uniforms.uColor.value.getHexString();

      // 2. Kill any running animations from the intro (App.jsx) to prevent conflicts
      gsap.killTweensOf(particleSystem.simulationShader.uniforms.amplitude);
      gsap.killTweensOf(particleSystem.renderShader.uniforms.uColor.value);
      gsap.killTweensOf(cam.position);

      // Master Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=6000", // Long scroll distance for smooth pacing
          scrub: 1,
          pin: true,
        },
      });
      console.log("1", particleSystem);

      const updateParticles = () => {
        if (particleSystem.simulationShader) {
          particleSystem.simulationShader.uniforms.amplitude.value =
            particleState.amplitude;
        }
        if (particleSystem.renderShader) {
          const c = new THREE.Color(particleState.color);
          particleSystem.renderShader.uniforms.uColor.value.copy(c);
        }
      };
      // Helper to animate particles via timeline
      const particleState = {
        amplitude: currentAmplitude,
        color: "#" + currentColor,
        onUpdate: updateParticles,
      };

      console.log("particleState", particleState);
      // Initial Scene

      // --- SCENE 1: The Void (Center) ---
      tl.to(
        particleState,
        {
          amplitude: 248,
          color: "#ffffff",
          onUpdate: updateParticles,
          duration: 2,
        },
        "<"
      )
        .to("#slide-1", { opacity: 1, duration: 1 })
        .to(
          "#slide-1 .word",
          { opacity: 1, y: 0, stagger: 0.05, duration: 1 },
          "<"
        )
        .to(cam.position, { z: -400, duration: 2, ease: "power1.inOut" }, "<") // Camera Move 1
        .to("#slide-1", { opacity: 0, duration: 1 }, "+=2") // Hold then fade
        .to(
          "#slide-1 .word",
          { opacity: 0, y: -20, stagger: 0.02, duration: 0.5 },
          "<"
        )

        // --- SCENE 2: Chaos (Top Left) ---
        // Transition Particles: Chaos -> Explosion
        .to(
          particleState,
          {
            amplitude: 248,
            color: "#ffffff",
            onUpdate: updateParticles,
            duration: 2,
          },
          "<"
        ) // Overlap with fade out
        .to(
          cam.position,
          { z: -350, x: -20, duration: 2, ease: "power1.inOut" },
          "<"
        ) // Camera Move 2
        .to("#slide-2", { opacity: 1, duration: 1 }, "<+0.5")
        .to(
          "#slide-2 .word",
          { opacity: 1, y: 0, stagger: 0.05, duration: 1 },
          "<"
        )
        .to("#slide-2", { opacity: 0, duration: 1 }, "+=2")
        .to(
          "#slide-2 .word",
          { opacity: 0, y: -20, stagger: 0.02, duration: 0.5 },
          "<"
        )

        // --- SCENE 3: Order (Bottom Right) ---
        // Transition Particles: Explosion -> Tremble (Red)
        .to(
          particleState,
          {
            amplitude: 5,
            color: "#ff0000",
            onUpdate: updateParticles,
            duration: 2,
          },
          "<"
        )
        .to(
          cam.position,
          { z: -300, x: 20, y: -20, duration: 2, ease: "power1.inOut" },
          "<"
        ) // Camera Move 3
        .to("#slide-3", { opacity: 1, duration: 1 }, "<+0.5")
        .to(
          "#slide-3 .word",
          { opacity: 1, y: 0, stagger: 0.05, duration: 1 },
          "<"
        )
        .to("#slide-3", { opacity: 0, duration: 1 }, "+=2")
        .to(
          "#slide-3 .word",
          { opacity: 0, y: -20, stagger: 0.02, duration: 0.5 },
          "<"
        )

        // --- SCENE 4: Chaos inside Order (Center Left) ---
        // Transition Particles: Tremble -> Fire (Orange)
        .to(
          particleState,
          {
            amplitude: 100,
            color: "#ffaa00",
            onUpdate: updateParticles,
            duration: 2,
          },
          "<"
        )
        .to(
          cam.position,
          { z: -250, x: -10, y: 10, duration: 2, ease: "power1.inOut" },
          "<"
        ) // Camera Move 4
        .to("#slide-4", { opacity: 1, duration: 1 }, "<+0.5")
        .to(
          "#slide-4 .word",
          { opacity: 1, y: 0, stagger: 0.05, duration: 1 },
          "<"
        )
        .to("#slide-4", { opacity: 0, duration: 1 }, "+=2")
        .to(
          "#slide-4 .word",
          { opacity: 0, y: -20, stagger: 0.02, duration: 0.5 },
          "<"
        )

        // --- SCENE 5: Balance (Center Right) ---
        // Transition Particles: Fire -> Sun (Yellow)
        .to(
          particleState,
          {
            amplitude: 48,
            color: "#ffdd00",
            onUpdate: updateParticles,
            duration: 2,
          },
          "<"
        )
        .to(
          cam.position,
          { z: -200, x: 0, y: 0, duration: 2, ease: "power1.inOut" },
          "<"
        ) // Camera Move 5
        .to("#slide-5", { opacity: 1, duration: 1 }, "<+0.5")
        .to(
          "#slide-5 .word",
          { opacity: 1, y: 0, stagger: 0.05, duration: 1 },
          "<"
        )
        .to("#slide-5", { opacity: 0, duration: 1 }, "+=2")
        .to(
          "#slide-5 .word",
          { opacity: 0, y: -20, stagger: 0.02, duration: 0.5 },
          "<"
        )

        // --- SCENE 6: Conclusion (Center) ---
        .to(cam.position, { z: -150, duration: 2, ease: "power1.inOut" }, "<") // Camera Move 6
        .to("#slide-6", { opacity: 1, duration: 1 }, "<+0.5")
        .to(
          "#slide-6 .word",
          { opacity: 1, y: 0, stagger: 0.05, duration: 1 },
          "<"
        )
        .to("#slide-6", { opacity: 0, duration: 1 }, "+=2")
        .to(
          "#slide-6 .word",
          { opacity: 0, y: -20, stagger: 0.02, duration: 0.5 },
          "<"
        );
    }, containerRef);

    return () => ctx.revert();
  }, [isReady]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative overflow-hidden font-serif text-white z-20">
      {/* Slide 1: Center */}
      <Slide id="slide-1" className="justify-center items-center text-center">
        <div className="text-3xl md:text-5xl font-light opacity-90 mix-blend-difference leading-relaxed">
          Before existence knew its own name, the cosmos held its breath in a
          timeless pause.
        </div>
        <br />
        <ParallaxText className="opacity-60 text-2xl md:text-4xl">
          A whisper of potential drifting through the dark.
        </ParallaxText>
      </Slide>

      {/* Slide 2: Top Left */}
      <Slide id="slide-2" className="justify-start items-start text-left pt-32">
        <div className="text-4xl md:text-6xl font-bold mix-blend-difference leading-tight">
          The cosmos erupted into absolute
        </div>
        <ParallaxText className="text-6xl md:text-8xl italic">
          CHAOS.
        </ParallaxText>
        <ParallaxText className="mt-8 text-xl md:text-2xl opacity-80 max-w-xl">
          Taking its first, violent breath of pure fury. The roar of creation
          was magnificent.
        </ParallaxText>
      </Slide>

      {/* Slide 3: Bottom Right */}
      <Slide
        id="slide-3"
        className="justify-end items-end text-right pb-32 pr-12">
        <div className="text-3xl md:text-5xl font-bold mix-blend-difference text-red-500">
          Is it order that we crave?
        </div>
        <ParallaxText className="mt-4 text-xl md:text-3xl italic opacity-60">
          A perfect shape. Complete. Silent. Cold.
        </ParallaxText>
        <ParallaxText className="text-xl md:text-3xl italic opacity-60">
          A world without life.
        </ParallaxText>
      </Slide>

      {/* Slide 4: Center Left */}
      <Slide
        id="slide-4"
        className="justify-start items-center text-left pl-12">
        <div className="text-4xl md:text-7xl font-black uppercase tracking-widest mix-blend-difference text-orange-500">
          Chaos inside the order.
        </div>
        <ParallaxText className="mt-6 text-2xl md:text-4xl mix-blend-difference max-w-lg">
          The storm held gently by a boundary, that sparks creation.
        </ParallaxText>
      </Slide>

      {/* Slide 5: Center Right */}
      <Slide id="slide-5" className="justify-end items-center text-right pr-12">
        <div
          as="h2"
          className="text-5xl md:text-8xl font-bold text-yellow-400 mix-blend-difference">
          Chaos gives it fire.
        </div>
        <ParallaxText className="text-3xl md:text-5xl mix-blend-difference mt-4">
          Order gives it form.
        </ParallaxText>
      </Slide>

      {/* Slide 6: Center */}
      <Slide id="slide-6" className="justify-center items-center text-center">
        <ParallaxText className="text-2xl md:text-4xl mix-blend-difference mb-12">
          And only together do they give us.
        </ParallaxText>
        <div
          as="h3"
          className="text-6xl md:text-9xl font-bold mix-blend-difference">
          light
        </div>
      </Slide>
    </div>
  );
};
// particleSystem.setAmplitude(120, 2, "sine.inOut");
// particleSystem.setColor("#ffffff", 2, "sine.inOut");
// particleSystem.setRotation(true);
// camera.animateCameraTo({ position: new THREE.Vector3(0, 0, -600) }, 2, "sine.inOut");
export default Story;
