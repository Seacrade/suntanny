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
      const controls = camera.controls;

      // 1. Capture current state from the engine to ensure seamless transition
      const currentAmplitude =
        particleSystem.simulationShader.uniforms.amplitude.value;
      const currentColor =
        particleSystem.renderShader.uniforms.uColor.value.getHexString();

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
          scrub: 1,
          pin: true,
        },
      });

      // Ensure target starts at center
      tl.set(controls.target, { x: 0, y: 0, z: 0 });
      //console.log("1", particleSystem);

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

      // 0. Initial Intro Animation (Auto-play)
      gsap.to(".intro-element", {
        opacity: 0.8,
        y: 0,
        duration: 1.5,
        stagger: 2,
        ease: "power3.out",
        delay: 0.5,
      });

      // Initial Scene

      // --- SCENE 0: Fade Out Intro ---
      // We use fromTo so it always starts at opacity 1 when at the top
      tl.fromTo(
        "#intro-slide",
        { opacity: 1, y: 0, pointerEvents: "auto" },
        {
          opacity: 0,
          y: -50,
          pointerEvents: "none",
          duration: 3,
          ease: "power2.inOut",
        },
        0
      );

      // --- SCENE 1: The Void (Center) ---
      tl.to(
        particleState,
        {
          amplitude: 30,
          color: "#000000",
          onUpdate: updateParticles,
          duration: 4,
        },
        "<"
      )
        .to("#slide-1", { opacity: 1, duration: 1 })
        .to(
          cam.position,
          { y: 10, z: -8000, duration: 4, ease: "power1.inOut" },
          "<"
        ) // Camera Move 1
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 4, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-1-text-1", { opacity: 1, y: 0, duration: 1 }, "<")
        .to(".slide-1-text-2", { opacity: 1, y: 0, duration: 1 }, "+=1")
        .to("#slide-1", { opacity: 0, duration: 1 }, "+=2") // Hold then fade

        // --- SCENE 2: Chaos (Top Left) ---
        // Transition Particles: Chaos -> Explosion
        .to(
          particleState,
          {
            amplitude: 248,
            color: "#ffffff",
            onUpdate: updateParticles,
            duration: 7,
          },
          "<"
        ) // Overlap with fade out

        // Move 1: Focus Top Left (Text 1 & 2)
        .to(
          cam.position,
          { z: -350, x: -20, duration: 2, ease: "power1.inOut" },
          "<"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 2, ease: "power1.inOut" },
          "<"
        )
        .to("#slide-2", { opacity: 1, duration: 1 }, "<")
        .to(".slide-2-text-1", { opacity: 1, duration: 1 }, "<")
        .to(".slide-2-text-2", { opacity: 1, duration: 1 }, "+=0.5")

        // Move 2: Focus Right (Text 3) - Pan Left
        .to(cam.position, { x: -50, duration: 2.5, ease: "power1.inOut" }, "<")
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 2.5, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-2-text-3", { opacity: 1, duration: 1 }, "<+0.5")

        // Move 3: Focus Left (Text 4) - Pan Right
        .to(
          cam.position,
          { x: 20, y: 20, duration: 2.5, ease: "power1.inOut" },
          "<+1"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 2.5, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-2-text-4", { opacity: 1, duration: 1 }, "<+0.5")

        .to("#slide-2", { opacity: 0, duration: 1 }, "+=2")

        // --- SCENE 3: The Yearning for Order (Red Sequence) ---
        // 3.1: Awakening of Order
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
          { x: -170, y: -105, z: 0, duration: 2, ease: "power1.inOut" },
          "<"
        )
        .to(controls.target, {
          x: -170,
          y: -105,
          z: 0,
          duration: 2,
          ease: "power1.inOut",
        })
        .to("#slide-3", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-1", { opacity: 1, duration: 1 }, "<")
        .to(".slide-3-text-1", { opacity: 0, duration: 1 }, "+=3")

        // 3.2: Fear of Chaos
        .to(
          cam.position,
          { z: -200, x: -9, y: 4, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-3-text-2", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-2", { opacity: 0, duration: 1 }, "+=3")

        // 3.3: Perfect Shape (Static)
        .to(
          particleState,
          { amplitude: 1, onUpdate: updateParticles, duration: 2 },
          "<"
        )
        .to(
          cam.position,
          { z: -260, x: 0, y: -40, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-3-text-3", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-3", { opacity: 0, duration: 1 }, "+=3")

        // 3.4: A World Without Life
        .to(
          cam.position,
          { z: -240, x: 0, y: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-3-text-4", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-4", { opacity: 0, duration: 1 }, "+=3")

        // --- SCENE 4: Life Arises (Orange Sequence) ---
        // 4.1: Chaos Inside Order
        .to(
          particleState,
          {
            amplitude: 80,
            color: "#ffaa00",
            onUpdate: updateParticles,
            duration: 2,
          },
          "<"
        )
        .to(
          cam.position,
          { z: -220, x: -60, y: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-3-text-5", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-5", { opacity: 0, duration: 1 }, "+=3")

        // 4.2: Gravity's Hand
        .to(
          cam.position,
          { z: -200, x: 60, y: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-3-text-6", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-6", { opacity: 0, duration: 1 }, "+=3")

        // --- SCENE 5: Balance (Yellow Sequence) ---
        // 5.1: Fire and Form
        .to(
          particleState,
          {
            amplitude: 40,
            color: "#ffdd00",
            onUpdate: updateParticles,
            duration: 2,
          },
          "<"
        )
        .to(
          cam.position,
          { z: -180, x: 0, y: 50, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-3-text-7", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-7", { opacity: 0, duration: 1 }, "+=3")

        // --- SCENE 6: Light (White Sequence) ---
        // 6.1: Light
        .to(
          particleState,
          {
            amplitude: 50,
            color: "#ffffff",
            onUpdate: updateParticles,
            duration: 2,
          },
          "<"
        )
        .to(
          cam.position,
          { z: -150, x: 0, y: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(
          controls.target,
          { x: 0, y: 0, z: 0, duration: 3, ease: "power1.inOut" },
          "<"
        )
        .to(".slide-3-text-8", { opacity: 1, duration: 1 }, "<+0.5")
        .to(".slide-3-text-8", { opacity: 0, duration: 1 }, "+=3")
        .to("#slide-3", { opacity: 0, duration: 1 }, "<"); // Fade out container at end
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
        <div className="flex flex-col items-center space-y-6 transform translate-y-6 max-w-2xl">
          {/* Top line */}
          <p className="text-center text-2xl md:text-4xl opacity-0 translate-y-10 intro-element">
            Before existence knew its own name the cosmos held its breath in a
            timeless pause
          </p>
          <br />
          {/* Bottom paragraph */}
          <p className="text-center text-2xl md:text-4xl opacity-0 translate-y-10 intro-element">
            In the deep silence of the void, the universe trembled, as if
            gathering the courage to be.
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
        <div className="absolute top-1/2 right-12 md:right-1/4 transform -translate-y-1/2 text-right text-xl md:text-3xl max-w-2xl mix-blend-difference opacity-0 slide-2-text-3">
          The roar of creation was magnificent, a brilliance so violent it
          humbled the void itself.
        </div>
        <div className="absolute bottom-24 left-12 md:bottom-40 md:left-1/4 text-left text-xl md:text-3xl max-w-2xl mix-blend-difference opacity-0 slide-2-text-4 z-50">
          And in that instant, another force awakened
        </div>
      </Slide>
      {/* Slide 3: Combined Sequence */}
      <Slide id="slide-3" className="pointer-events-none">
        {/* 3.1: Awakening of Order (Right) */}
        <div className="absolute inset-0 flex justify-end items-center pr-12 md:pr-24 opacity-0 slide-3-text-1">
          <div className="text-right max-w-xl">
            <div className="text-3xl md:text-5xl font-bold mix-blend-difference text-red-500">
              And in that instant, another force awakened:
            </div>
            <div className="mt-4 text-xl md:text-2xl italic opacity-80">
              the yearning for order, for boundaries, for the illusion of
              control. The universe's instinct to reclaim its scattered chaos
              and turn disorder into meaning.
            </div>
          </div>
        </div>

        {/* 3.2: Fear of Chaos (Left) */}
        <div className="absolute inset-0 flex justify-start items-center pl-12 md:pl-24 opacity-0 slide-3-text-2">
          <div className="text-left max-w-xl">
            <div className="text-3xl md:text-5xl font-bold mix-blend-difference text-red-400">
              We are taught to fear chaos.
            </div>
            <div className="mt-4 text-xl md:text-2xl italic opacity-80">
              To turn away from the very force that gave us birth.
            </div>
          </div>
        </div>

        {/* 3.3: Perfect Shape (Top) */}
        <div className="absolute inset-0 flex justify-center items-start pt-32 opacity-0 slide-3-text-3">
          <div className="text-center max-w-2xl">
            <div className="text-3xl md:text-5xl font-bold mix-blend-difference text-red-300">
              So is it order that we crave?
            </div>
            <div className="mt-4 text-xl md:text-2xl italic opacity-80">
              A perfect shape. Complete. Silent. Cold. Flawless symmetry, the
              triumph of law over frenzy.
            </div>
          </div>
        </div>

        {/* 3.4: A World Without Life (Bottom) */}
        <div className="absolute inset-0 flex justify-center items-end pb-32 opacity-0 slide-3-text-4">
          <div className="text-center max-w-2xl">
            <div className="text-3xl md:text-5xl font-bold mix-blend-difference text-red-200">
              This, we imagine, is the pinnacle of existence.
            </div>
            <div className="mt-4 text-xl md:text-2xl italic opacity-80">
              A world without motion. A world without surprise. A world without
              life.
            </div>
          </div>
        </div>

        {/* 4.1: Chaos Inside Order (Right) */}
        <div className="absolute inset-0 flex justify-end items-center pr-12 md:pr-24 opacity-0 slide-3-text-5">
          <div className="text-right max-w-xl">
            <div className="text-4xl md:text-6xl font-black uppercase tracking-widest mix-blend-difference text-orange-500">
              But life...
            </div>
            <div className="mt-6 text-xl md:text-3xl mix-blend-difference">
              life does not arise from stillness. It is the chaos inside the
              order, the storm held gently by a boundary, that sparks creation.
            </div>
          </div>
        </div>

        {/* 4.2: Gravity's Hand (Left) */}
        <div className="absolute inset-0 flex justify-start items-center pl-12 md:pl-24 opacity-0 slide-3-text-6">
          <div className="text-left max-w-xl">
            <div className="text-2xl md:text-4xl mix-blend-difference">
              A swirling, raging fire, held together by the quiet, patient hand
              of gravity.
            </div>
          </div>
        </div>

        {/* 5.1: Fire and Form (Top) */}
        <div className="absolute inset-0 flex justify-center items-start pt-32 opacity-0 slide-3-text-7">
          <div className="text-center">
            <div className="text-5xl md:text-8xl font-bold text-yellow-400 mix-blend-difference">
              Chaos gives it fire.
            </div>
            <div className="text-3xl md:text-5xl mix-blend-difference mt-4">
              Order gives it form.
            </div>
          </div>
        </div>

        {/* 6.1: Light (Center) */}
        <div className="absolute inset-0 flex justify-center items-center opacity-0 slide-3-text-8">
          <div className="text-center max-w-3xl">
            <div className="text-2xl md:text-4xl mix-blend-difference mb-8">
              And only together do they give us light.
            </div>
            <div className="text-xl md:text-3xl italic opacity-80">
              It gives us what neither chaos nor order could ever create alone.
            </div>
          </div>
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
