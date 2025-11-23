import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParallaxText from "../components/ParallaxText";

gsap.registerPlugin(ScrollTrigger);

const Story = ({ isReady }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (!isReady) return;

    const ctx = gsap.context(() => {
      const experience = window.experience;
      if (!experience || !experience.world || !experience.world.page) return;

      const particleSystem = experience.world.page.particleSystem;
      const camera = experience.camera;

      // Initial State: Emptyness before the big bang (Blue/Purple)
      console.log(camera.getPosition());
      particleSystem.setAmplitude(100, 3, "sine.in");
      particleSystem.setColor("#4b0082", 3, "sine.inOut"); // Indigo/Purple
      particleSystem.setRotation(true);
      // Animate smoothly from current position to z: -400

      camera.animateCameraTo({ z: -400 }, 2.5);

      // Section 1: The Void & The Command
      ScrollTrigger.create({
        trigger: "#section-1",
        start: "top center",
        end: "bottom center",
        scrub: true,
        onEnter: () => {
          // Chaos -> Order
          particleSystem.setAmplitude(30, 3);
          particleSystem.setColor("#ffffff", 3); // White/Metallic
        },
        onLeaveBack: () => {
          // Back to Chaos
          particleSystem.setAmplitude(248, 3);
          particleSystem.setColor("#4b0082", 3);
        },
      });

      // Section 2: The Prison & The Spark
      ScrollTrigger.create({
        trigger: "#section-2",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          // Tremble / Red Glow
          particleSystem.setAmplitude(5, 0.5); // Slight tremble
          particleSystem.setColor("#ff0000", 1); // Red glow
        },
        onLeaveBack: () => {
          particleSystem.setAmplitude(0, 1);
          particleSystem.setColor("#ffffff", 1);
        },
      });

      // Section 3: The Fight & The Ignition
      ScrollTrigger.create({
        trigger: "#section-3",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          // Explosion -> Chaos (Sun)
          particleSystem.setAmplitude(248, 0.5); // Explode
          particleSystem.setColor("#ffaa00", 0.5); // Golden/Fire
        },
        onLeaveBack: () => {
          particleSystem.setAmplitude(5, 1);
          particleSystem.setColor("#ff0000", 1);
        },
      });

      // Section 4: The Star & The Balance
      ScrollTrigger.create({
        trigger: "#section-4",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          // Sun (Balance)
          particleSystem.setAmplitude(48, 2); // Controlled Chaos
          particleSystem.setColor("#ffdd00", 2); // Bright Sun
        },
        onLeaveBack: () => {
          particleSystem.setAmplitude(248, 2);
          particleSystem.setColor("#ffaa00", 2);
        },
      });

      // Section 5: The Gift & Conclusion
      ScrollTrigger.create({
        trigger: "#section-5",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          // Pulse / Fade
          particleSystem.setAmplitude(48, 2);
          // Maybe fade out or zoom camera?
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isReady]);

  return (
    <div
      ref={containerRef}
      className="font-serif relative w-full z-20 pointer-events-auto text-white">
      {/* Section 1: The Void & The Command */}
      <section
        id="section-landing"
        className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl text-center space-y-12">
          <ParallaxText className="text-2xl md:text-4xl font-light opacity-90 mix-blend-difference">
            Before existence knew its own name, the cosmos held its breath in a
            timeless pause. In the deep silence of the void, the universe
            trembled, as if gathering the courage to be. A whisper of potential
            drifting through the dark.
          </ParallaxText>
          <div className="h-52"></div> {/* Spacer for timing */}
          <ParallaxText className="text-2xl md:text-4xl font-light opacity-80 mix-blend-difference">
            Then in its final moment of peace, the silence shattered.
          </ParallaxText>
        </div>
      </section>
      <section
        id="section-1"
        className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl text-center space-y-12">
          <ParallaxText className="text-2xl md:text-4xl font-light opacity-90 mix-blend-difference">
            The cosmos erupted into absolute CHAOS, taking its first, violent
            breath of pure fury. The roar of creation was magnificent, a
            brilliance so violent it humbled the void itself.
          </ParallaxText>
          <div className="h-32"></div> {/* Spacer for timing */}
          <ParallaxText className="text-2xl md:text-4xl font-light opacity-80 mix-blend-difference">
            And in that instant, another force awakened: the yearning for order,
            for boundaries, for the illusion of control.The universe's instinct
            to reclaim its scattered chaos and turn disorder into meaning. We
            are taught to fear chaos. To turn away from the very force that gave
            us birth.
          </ParallaxText>
        </div>
      </section>
      {/* Section 2: The Prison & The Spark */}
      <section
        id="section-2"
        className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl text-center space-y-12">
          <ParallaxText className="text-3xl md:text-5xl font-bold mix-blend-difference">
            So is it order that we crave? A perfect shape. Complete. Silent.
            Cold. Flawless symmetry, the triumph of law over frenzy. This, we
            imagine, is the pinnacle of existence.
          </ParallaxText>
          <ParallaxText className="text-xl md:text-2xl italic opacity-60 mix-blend-difference">
            A world without motion. A world without surprise. A world without
            life.
          </ParallaxText>
          <div className="h-32"></div>
          <ParallaxText className="text-3xl md:text-5xl font-bold text-red-500 mix-blend-difference">
            But life... life does not arise from stillness.
          </ParallaxText>
        </div>
      </section>

      {/* Section 3: The Fight & The Ignition */}
      <section
        id="section-3"
        className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl text-center space-y-12">
          <ParallaxText className="text-4xl md:text-6xl font-black uppercase tracking-widest mix-blend-difference">
            It is the chaos inside the order,
          </ParallaxText>
          <ParallaxText className="text-2xl md:text-3xl mix-blend-difference">
            the storm held gently by a boundary,that sparks creation.
          </ParallaxText>
          <div className="h-32"></div>
          <ParallaxText className="text-3xl md:text-5xl font-bold text-orange-500 mix-blend-difference">
            A swirling, raging fire, held together by the quiet, patient hand of
            gravity.
          </ParallaxText>
        </div>
      </section>

      {/* Section 4: The Star & The Balance */}
      <section
        id="section-4"
        className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl text-center space-y-12">
          <ParallaxText
            as="h2"
            className="text-6xl md:text-9xl font-bold text-yellow-400 mix-blend-difference">
            Chaos gives it fire.
          </ParallaxText>
          <ParallaxText className="text-2xl md:text-4xl mix-blend-difference">
            Order gives it form.
          </ParallaxText>
          <div className="h-32"></div>
          <ParallaxText className="text-xl md:text-3xl leading-relaxed mix-blend-difference">
            And only together
          </ParallaxText>
        </div>
      </section>

      {/* Section 5: The Gift & Conclusion */}
      <section
        id="section-5"
        className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl text-center space-y-12">
          <ParallaxText className="text-2xl md:text-4xl mix-blend-difference">
            do they give us light.
          </ParallaxText>
          <ParallaxText className="text-xl md:text-3xl opacity-80 mix-blend-difference">
            It gives us what neither chaos nor order could ever create alone.
          </ParallaxText>
          <div className="h-64"></div>
          <ParallaxText
            as="h3"
            className="text-5xl md:text-8xl font-bold  mix-blend-difference">
            Michael Truong
          </ParallaxText>
        </div>
      </section>

      <section className="h-[50vh]"></section>
    </div>
  );
};

export default Story;
