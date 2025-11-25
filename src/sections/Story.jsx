import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const Slide = ({ children, className, id }) => (
  <div
    id={id}
    className={`absolute inset-0 flex p-8 md:p-20 opacity-0 pointer-events-none ${className}`}>
    <div className="max-w-4xl">{children}</div>
  </div>
);

const Story = ({ isReady, onStoryEnd }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (!isReady) return;

    const ctx = gsap.context(() => {
      const experience = window.experience;
      if (!experience || !experience.world || !experience.world.page) return;

      const particleSystem = experience.world.page.particleSystem;
      const camera = experience.camera;
      const cam = camera.instance;
      const controls = camera.controls;

      // Responsive Distance Factor
      const isMobile = window.innerWidth < 768;
      const dFactor = isMobile ? 1.5 : 1;

      // 1. Capture current state from the engine to ensure seamless transition
      const currentAmplitude = particleSystem.simulationShader.uniforms.amplitude.value;
      const currentColor = particleSystem.renderShader.uniforms.uColor.value.getHexString();

      // 2. Kill any running animations from the intro (App.jsx) to prevent conflicts
      gsap.killTweensOf(particleSystem.simulationShader.uniforms.amplitude);
      gsap.killTweensOf(particleSystem.renderShader.uniforms.uColor.value);
      gsap.killTweensOf(cam.position);
      gsap.killTweensOf(controls.target);

      // Master Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=9999", // Long scroll distance for smooth pacing
          scrub: 2,
          pin: true,
        },
      });

      // Ensure target starts at center
      tl.set(controls.target, { x: 0, y: 0, z: 0 });
      console.log("1", particleSystem);

      const updateParticles = () => {
        if (particleSystem.simulationShader) {
          particleSystem.simulationShader.uniforms.amplitude.value = particleState.amplitude;
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
        onStart: particleSystem.setRotation(false),
      };

      // 0. Initial Intro Animation (Auto-play)
      gsap.to(".intro-element", {
        opacity: 0.8,
        y: 0,
        duration: 1.5,
        stagger: 1.5,
        ease: "power3.out",
        delay: 1.5,
      });

      // Initial Scene

      // --- SCENE 0: Fade Out Intro ---
      // We use fromTo so it always starts at opacity 1 when at the top
      tl.fromTo(
        "#intro-slide",
        { opacity: 1, pointerEvents: "auto" },
        {
          opacity: 0,
          pointerEvents: "none",
          duration: 5,
          ease: "power2.inOut",
        },
        0
      )
        .to(
          particleState,
          {
            amplitude: 10,
            color: "black",
            onUpdate: updateParticles,
            duration: 0,
          },
          "<"
        )

        // --- SCENE 1: The Void (Center) ---\
        .to(cam.position, { z: -150 * dFactor, duration: 1, ease: "power1.inOut" }, ">") // move camera away
        .to(controls.target, { x: 0, y: 0, z: 0, duration: 1, ease: "power1.inOut" }, ">") //set up model
        .to("#slide-1", { opacity: 0.9, duration: 0 }, "<")
        .to(".slide-1-text-1", { opacity: 0.9, duration: 1 }, "#slide-1")
        .to(".slide-1-text-2", { opacity: 0.9, duration: 1 }, "#slide-1+=2")
        .to("#slide-1", { opacity: 0, duration: 3 }, "+=2") // Hold then fade

        // --- SCENE 2: Chaos (Top Left) ---
        // Transition Particles: Chaos -> Explosion

        //.to(cam.position, { z: -200, duration: 4, ease: "power1.inOut" }, "<")
        .to(controls.target, { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" }, "<")

        .to(
          particleState,
          {
            amplitude: 0,
            color: "#ffffff",
            onUpdate: updateParticles,
            duration: 8,
          },
          "+=1"
        ) // Overlap with fade out

        // Move 1: Focus Top Left (Text 1 & 2)
        .to(cam.position, { z: -8000 * dFactor, duration: 6, ease: "power1.inOut" }, "<")
        .to(controls.target, { x: 0, y: 0, z: 0, duration: 6, ease: "power1.inOut" }, "<")
        .to("#slide-2", { opacity: 1, duration: 1 }, "<1")
        .to(".slide-2-text-1", { opacity: 1, duration: 1 }, "<")
        .to(".slide-2-text-2", { opacity: 1, duration: 0.5 }, "<2")
        .to(
          particleState,
          {
            amplitude: 250,
            color: "#ffffff",
            onUpdate: updateParticles,
            duration: 6,
          },
          ">2"
        )
        .to(cam.position, { z: -150 * dFactor, duration: 4, ease: "power1.inOut" }, ">")

        // Move 2: Focus Right (Text 3) - Pan Left
        .to(".slide-2-text-3", { opacity: 1, duration: 4 }, "+=1") //5
        .to(".slide-2-text-4", { opacity: 1, duration: 4 }, "+=1") //7

        .to("#slide-2", { opacity: 0, duration: 4 }, "+=2")

        // --- SCENE 3: The Yearning for Order (Red Sequence) ---
        // 3.0: Another Force Awakened
        .to(
          particleState,
          {
            amplitude: 1,
            color: "#ff0000",
            onUpdate: updateParticles,
            duration: 2,
          },
          "+=1"
        )
        .to(
          controls.target,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: 2,
            ease: "power1.inOut",
          },
          "+=1"
        )
        .to("#slide-3", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-0", { opacity: 1, duration: 1 }, "<")
        .to(".slide-3-text-0", { opacity: 0, duration: 1 }, "+=3")

        // 3.1: Awakening of Order

        .to(
          controls.target,
          {
            x: 91,
            y: -24,
            z: -80,
            duration: 2,
            ease: "sine.inOut",
          },
          "+=1"
        )
        .to(
          cam.position,
          {
            x: 114 * dFactor,
            y: -174 * dFactor,
            z: -55 * dFactor,
            duration: 2,
            ease: "sine.inOut",
          },
          "<"
        )

        .to(".slide-3-text-1", { opacity: 1, duration: 1 }, "+=1")
        .to(".slide-3-text-1", { opacity: 0, duration: 1 }, "+=4")

        // 3.2: Fear of Chaos
        .to(
          cam.position,
          {
            x: -155 * dFactor,
            y: 54 * dFactor,
            z: -110 * dFactor,
            duration: 2,
            ease: "sine.inOut",
          },
          "<"
        )
        .to(controls.target, { x: 92, y: -14, z: -88, duration: 2, ease: "sine.inOut" }, "<")
        .to(".slide-3-text-2", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-2", { opacity: 0, duration: 1 }, "+=3")

        // 3.3: Perfect Shape (Static)
        .to(
          cam.position,
          { x: -94 * dFactor, y: 154 * dFactor, z: 94 * dFactor, duration: 2, ease: "sine.inOut" },
          "<"
        )
        .to(controls.target, { x: 77, y: 66, z: -76, duration: 2, ease: "sine.inOut" }, "<")

        // Title
        .to(".slide-3-text-3-title", { opacity: 1, duration: 1 }, "<+1")

        // Complete
        .to(".slide-3-text-3-word-1", { opacity: 1, duration: 0.5 }, "+=1")
        .to(".slide-3-text-3-word-1", { opacity: 0, duration: 0.5 }, "+=2")

        // Silent
        .to(".slide-3-text-3-word-2", { opacity: 1, duration: 0.5 }, "<")
        .to(".slide-3-text-3-word-2", { opacity: 0, duration: 0.5 }, "+=2")

        // Cold + Blue Color
        .to(".slide-3-text-3-word-3", { opacity: 1, duration: 0.5 }, "<")
        .to(
          particleState,
          {
            amplitude: 1,
            color: "#48C7F5",
            onUpdate: updateParticles,
            duration: 1,
          },
          "<"
        )
        .to(".slide-3-text-3-word-3", { opacity: 0, duration: 0.5 }, "+=1")
        .to(".slide-3-text-3-title", { opacity: 0, duration: 0.5 }, "<") // Fade out title too

        // 3.4: A World Without Life

        .to(cam.position, { x: 0, y: 0, z: -500 * dFactor, duration: 2, ease: "sine.inOut" }, "+=3")
        .to(controls.target, { x: 0, y: 0, z: 0, duration: 2, ease: "sine.inOut" }, "<")

        .to(".slide-3-text-4", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-4", { opacity: 0, duration: 1 }, "+=3")

        // --- SCENE 4: Life Arises (Orange Sequence) ---
        // 4.1: Chaos Inside Order
        .to(
          particleState,
          {
            amplitude: 80,
            color: "#f57648",
            onUpdate: updateParticles,
            duration: 2,
          },
          "<"
        )
        .to(
          cam.position,
          { z: -220 * dFactor, x: -60 * dFactor, y: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(controls.target, { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" }, "<")
        .to(".slide-3-text-5", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-5", { opacity: 0, duration: 1 }, "+=3")

        // 4.2: Gravity's Hand
        .to(
          cam.position,
          { z: -200 * dFactor, x: 160 * dFactor, y: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(controls.target, { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" }, "<")
        .to(".slide-3-text-6", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-6", { opacity: 0, duration: 1 }, "+=3")

        // --- SCENE 5: Balance (Yellow Sequence) ---
        // 5.1: Fire and Form (Top)
        .to(
          particleState,
          {
            amplitude: 60,
            color: "#ff4500", // Fire Orange
            onUpdate: updateParticles,
            duration: 3,
          },
          "<"
        )
        .to(
          cam.position,
          {
            z: -180 * dFactor,
            x: 20 * dFactor,
            y: 50 * dFactor,
            duration: 3,
            ease: "power1.inOut",
          },
          "<"
        ) // Slight pan
        .to(controls.target, { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" }, "<")

        // Chaos gives it fire
        .to(".slide-3-text-7-1", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-7-1", { opacity: 0, duration: 1 }, "+=2")

        // Order gives it form
        .to(".slide-3-text-7-2", { opacity: 1, duration: 1 }, "<")
        .to(".slide-3-text-7-2", { opacity: 0, duration: 1 }, "+=2")

        // --- SCENE 6: Light (White Sequence) ---
        // 6.1: Light Part 1
        .to(".slide-3-text-8-1", { opacity: 1, duration: 1 }, "<+0.5")
        .call(() => particleSystem.setRotation(true), null, "<") // Enable rotation

        // 6.2: Light Part 2
        .to(".slide-3-text-8-2", { opacity: 1, duration: 1 }, "+=1")

        // Fade out both
        .to(".slide-3-text-8-1", { opacity: 0, duration: 1 }, "+=2")
        .to(".slide-3-text-8-2", { opacity: 0, duration: 1 }, "<")
        .to(
          cam.position,
          { z: -450 * dFactor, x: 0, y: 0, duration: 2, ease: "power2.inOut" },
          "+=0.5"
        )
        // --- SCENE 7: The Flash & Morph ---
        // Zoom In + Flash
        .to(cam.position, { z: -10 * dFactor, x: 0, y: 0, duration: 2, ease: "power2.in" }, "+=15")
        .to(controls.target, { x: 0, y: 0, z: 0, duration: 2, ease: "power2.in" }, "<")
        .to("#white-overlay", { opacity: 1, duration: 1 }, "+=2") // Flash at end of zoom

        // Morph (Hidden)
        .call(
          () => {
            if (tl.scrollTrigger.direction > 0) {
              particleSystem.morph(2); // Yin Yang
            } else {
              particleSystem.morph(0); // Sphere
            }
          },
          null,
          ">"
        )

        // Zoom Out + Reveal
        .to(cam.position, { z: -450 * dFactor, duration: 3, ease: "power2.out" }, "+=3")
        .to("#white-overlay", { opacity: 0, duration: 0.5 }, "<") // Fade out overlay to reveal

        // --- SCENE 8: Ending Text ---
        .to(".slide-3-text-9", { opacity: 1, duration: 1 }, "-=1") // Fade in text as zoom finishes
        .to("#slide-3", { opacity: 0, duration: 1 }, "+=3") // End
        .call(() => onStoryEnd && onStoryEnd());
    }, containerRef);

    return () => ctx.revert();
  }, [isReady]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative overflow-hidden font-serif text-white z-20">
      {/* Intro Slide: Auto Fade In */}
      <div
        id="intro-slide"
        className="absolute inset-0 flex flex-col justify-center items-center text-align z-30 pointer-events-none">
        {/* --- Centered Group (top + bottom with space between) --- */}
        <div className="flex flex-col items-center space-y-6 transform translate-y-6 max-w-3xl">
          {/* Top line */}
          <p className="text-center text-2xl md:text-4xl opacity-0 translate-y-10 intro-element">
            Before existence knew its own name the cosmos held its breath in a timeless pause
          </p>
          <br />
          {/* Bottom paragraph */}
          <p className="text-center text-2xl md:text-4xl opacity-0 translate-y-10 intro-element">
            In the deep silence of the void, the universe trembled, as if gathering the courage to
            be.
          </p>
        </div>

        {/* --- Scroll Cue --- */}
        <div className="absolute bottom-12 flex flex-col items-center pointer-events-none opacity-0 intro-element">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">
            Scroll to Explore
          </span>
          <div className="w-px h-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/80 animate-scroll-line"></div>
          </div>
        </div>
      </div>

      {/* Slide 1: Center */}
      <Slide id="slide-1" className="justify-center items-center text-center">
        <div className="flex flex-col gap-16">
          <div className="text-center text-2xl md:text-4xl opacity-0 slide-1-text-1">
            Then in its final moment of peace,
          </div>
          <div className="text-2xl md:text-4xl opacity-0 slide-1-text-2">
            the silence shattered.
          </div>
        </div>
      </Slide>
      {/* Slide 2: Top Left */}
      <Slide id="slide-2" className="justify-start items-start pt-32 md:pt-48">
        <div className="text-xl md:text-3xl mix-blend-difference leading-tight opacity-0 slide-2-text-1">
          The cosmos erupted into absolute
        </div>
        <div className="text-6xl md:text-5xl italic font-bold mix-blend-difference mt-4 opacity-0 slide-2-text-2">
          CHAOS.
        </div>
        <div className="slide-2-text-3 absolute top-1/2 right-12 md:right-1/4 transform -translate-y-1/2 text-right text-xl md:text-3xl max-w-2xl mix-blend-difference opacity-0">
          The roar of creation was magnificent, a brilliance so violent it humbled the void itself.
        </div>
        <div className="slide-2-text-4 absolute bottom-24 left-12 md:bottom-40 md:left-1/4 text-left text-xl md:text-3xl max-w-2xl mix-blend-difference opacity-0  z-50">
          And in that instant,
        </div>
      </Slide>
      {/* Slide 3: Combined Sequence */}
      <Slide id="slide-3" className="pointer-events-none">
        {/* 3.0: Another Force Awakened (Center) */}
        <div className="slide-3-text-0 absolute inset-0 flex justify-center items-center text-center text-3xl md:text-3xl max-w-4xl mx-auto mix-blend-difference opacity-0 z-50">
          another force awakened
        </div>

        {/* 3.1: Awakening of Order (Right) */}
        <div className="absolute inset-0 flex justify-end items-center pr-12 md:pr-24 opacity-0 slide-3-text-1">
          <div className="text-right max-w-3xl">
            <div className="uppercase text-3xl md:text-5xl font-bold mix-blend-difference text-red-500">
              the yearning for order
            </div>
            <div className="mt-4 text-xl md:text-2xl italic opacity-80">
              The universe's instinct to reclaim its scattered chaos and control its disorder.
            </div>
          </div>
        </div>

        {/* 3.2: Fear of Chaos (Left) */}
        <div className="absolute inset-0 flex justify-start items-center pl-12 md:pl-24 opacity-0 slide-3-text-2">
          <div className="text-left max-w-xl">
            <div className="text-2xl md:text-5xl font-bold mix-blend-difference text-red-400 max-w-lg">
              We are taught to fear chaos.
            </div>
            <div className="mt-4 text-xl md:text-2xl  opacity-100">
              So is it order that we crave?
            </div>
          </div>
        </div>

        {/* 3.3: Perfect Shape (Top) */}
        <div className="absolute inset-0 flex flex-col justify-start items-center pt-32 pointer-events-none">
          <div className="text-center max-w-2xl">
            <div className="text-3xl md:text-5xl font-bold mix-blend-difference opacity-0 slide-3-text-3-title">
              A perfect shape.
            </div>
            <div className="relative mt-4 h-8 w-full flex justify-center items-center">
              <div className="absolute text-xl md:text-2xl italic opacity-0 slide-3-text-3-word-1">
                Complete.
              </div>
              <div className="absolute text-xl md:text-2xl italic opacity-0 slide-3-text-3-word-2">
                Silent.
              </div>
              <div className="absolute text-xl md:text-2xl italic opacity-0 slide-3-text-3-word-3 ">
                Cold.
              </div>
            </div>
          </div>
        </div>

        {/* 3.4: A World Without Life (Bottom) */}
        <div className="absolute inset-0 flex justify-center items-end pb-12 md:pb-16 opacity-0 slide-3-text-4">
          <div className="text-center max-w-2xl px-4">
            <div className="text-3xl md:text-5xl font-bold mix-blend-difference ">
              A world without motion
            </div>
            <div className="mt-4 text-xl md:text-2xl italic opacity-80">A world without life. </div>
          </div>
        </div>

        {/* 4.1: Chaos Inside Order (Right) */}
        <div className="absolute inset-0 flex justify-end items-center pr-12 md:pr-24 opacity-0 slide-3-text-5">
          <div className="text-right max-w-xl">
            <div className="text-4xl md:text-6xl font-black uppercase tracking-widest mix-blend-difference">
              But life
            </div>
            <div className="mt-6 text-xl md:text-3xl mix-blend-difference">
              does not arise from stillness. It is the chaos inside the order, the storm held gently
              by a boundary, that sparks creation.
            </div>
          </div>
        </div>

        {/* 4.2: Gravity's Hand (Left) */}
        <div className="absolute inset-0 flex justify-start items-center pl-12 md:pl-24 opacity-0 slide-3-text-6">
          <div className="text-left max-w-xl">
            <div className="text-2xl md:text-4xl mix-blend-difference">
              A swirling, raging fire, held together by the quiet, patient hand of gravity.
            </div>
          </div>
        </div>

        {/* 5.1: Fire and Form (Top & Bottom) */}
        <div className="absolute inset-0 flex flex-col justify-between items-center py-32 pointer-events-none">
          <div className="text-4xl md:text-7xl font-bold  mix-blend-difference opacity-0 slide-3-text-7-1 mt-12">
            Chaos gives it fire.
          </div>
          <div className="text-4xl md:text-7xl font-bold  mix-blend-difference opacity-0 slide-3-text-7-2 mb-12">
            Order gives it form.
          </div>
        </div>

        {/* 6.1: Light (Center) */}
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <div className="text-center max-w-3xl">
            <div className="text-2xl md:text-4xl mix-blend-difference mb-8 opacity-0 slide-3-text-8-1">
              And only together do they give us
            </div>
            <div className="text-2xl md:text-4xl italic opacity-0 slide-3-text-8-2">
              what neither chaos nor order could ever create alone.
            </div>
          </div>
        </div>

        {/* 7.1: Yin Yang / End (Center) */}
        <div className="absolute inset-0 flex justify-center items-center opacity-0 slide-3-text-9">
          <div className="text-center max-w-3xl">
            <div className="text-3xl md:text-5xl font-bold mix-blend-difference mb-4">
              The Story Ends Here.
            </div>
            <div className="text-xl md:text-2xl opacity-80">But creation continues.</div>
          </div>
        </div>
      </Slide>

      {/* 8.1: Playground Overlay */}
      <div
        id="white-overlay"
        className="absolute inset-0 bg-white opacity-0 pointer-events-none z-40"></div>
      <div
        id="playground-text"
        className="absolute inset-0 flex justify-center items-center opacity-0 pointer-events-none z-50">
        <div className="text-black text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-4">Playground</h1>
          <p className="text-xl md:text-2xl">Interact with the particles.</p>
        </div>
      </div>
    </div>
  );
};
// particleSystem.setAmplitude(120, 2, "sine.inOut");
// particleSystem.setColor("#ffffff", 2, "sine.inOut");
// particleSystem.setRotation(true);
// camera.animateCameraTo({ position: new THREE.Vector3(0, 0, -600) }, 2, "sine.inOut");
export default Story;
