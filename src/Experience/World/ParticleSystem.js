import * as THREE from "three";
import gsap from "gsap";

import simVertex from "../Shaders/Particles/simulation.vert";
import simFragment from "../Shaders/Particles/simulation.frag";
import renderVertex from "../Shaders/Particles/render.vert";
import renderFragment from "../Shaders/Particles/render.frag";

import FBO from "../Utils/FBO.js";
import { CONFIG } from "../Config.js";
import { createDataTexture } from "../Utils/TextureHelper.js";

// Import the worker
import GeometryWorker from "../Utils/Geometry.worker.js?worker";

export default class ParticleSystem {
  constructor(experience) {
    this.experience = experience;
    this.renderer = this.experience.renderer.instance;
    this.scene = this.experience.scene;
    this.time = this.experience.time;

    this.currentState = 0;
    this.isReady = false;

    this.init();
  }

  init() {
    // Initialize Worker
    this.worker = new GeometryWorker();

    // Listen for results
    this.worker.onmessage = (e) => {
      this.handleWorkerData(e.data);
    };

    // Start calculation in background
    this.worker.postMessage({
      type: "generate",
      config: {
        particleCount: CONFIG.particleCount,
        sizes: CONFIG.sizes,
      },
    });
  }

  handleWorkerData(data) {
    const { sphereData, cubeData, yinYangData, torusData, dnaData, heartData } =
      data;

    const width = CONFIG.width;
    const height = CONFIG.height;

    // Create Textures
    const texture = createDataTexture(sphereData, width, height);
    texture.mapping = THREE.UVMapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const targetTexture = createDataTexture(cubeData.positions, width, height);
    const targetTexture2 = createDataTexture(
      yinYangData.positions,
      width,
      height
    );
    const targetTexture3 = createDataTexture(
      torusData.positions,
      width,
      height
    );
    const targetTexture4 = createDataTexture(dnaData.positions, width, height);
    const targetTexture5 = createDataTexture(
      heartData.positions,
      width,
      height
    );

    this.simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { type: "t", value: texture },
        uTarget: { type: "t", value: targetTexture },
        uTarget2: { type: "t", value: targetTexture2 },
        uTarget3: { type: "t", value: targetTexture3 },
        uTarget4: { type: "t", value: targetTexture4 },
        uTarget5: { type: "t", value: targetTexture5 },
        uState1: { type: "i", value: 0 },
        uState2: { type: "i", value: 0 },
        uTransition: { type: "f", value: 0 },
        timer: { type: "f", value: 0 },
        frequency: { type: "f", value: 0.01 },
        amplitude: { type: "f", value: 48 },
        maxDistance: { type: "f", value: 55 },
      },
      vertexShader: simVertex,
      fragmentShader: simFragment,
    });

    this.renderShader = new THREE.ShaderMaterial({
      uniforms: {
        positions: { type: "t", value: null },
        uPointSize: { type: "f", value: CONFIG.sizes.point },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColor: { value: CONFIG.colors.primary },
        uState1: { type: "i", value: 0 },
        uState2: { type: "i", value: 0 },
        uTransition: { type: "f", value: 0 },
        big: {
          type: "v3",
          value: CONFIG.colors.big,
        },
        small: {
          type: "v3",
          value: CONFIG.colors.small,
        },
      },
      vertexShader: renderVertex,
      fragmentShader: renderFragment,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.FBO = new FBO(
      width,
      height,
      this.renderer,
      this.simulationShader,
      this.renderShader
    );

    this.FBO.particles.geometry.setAttribute(
      "aTargetColor",
      new THREE.BufferAttribute(cubeData.colors, 3)
    );
    this.FBO.particles.geometry.setAttribute(
      "aTargetColor2",
      new THREE.BufferAttribute(yinYangData.colors, 3)
    );
    this.FBO.particles.geometry.setAttribute(
      "aTargetColor3",
      new THREE.BufferAttribute(torusData.colors, 3)
    );
    this.FBO.particles.geometry.setAttribute(
      "aTargetColor4",
      new THREE.BufferAttribute(dnaData.colors, 3)
    );
    this.FBO.particles.geometry.setAttribute(
      "aTargetColor5",
      new THREE.BufferAttribute(heartData.colors, 3)
    );

    this.scene.add(this.FBO.particles);

    this.isReady = true;

    // Terminate worker as we don't need it anymore
    this.worker.terminate();
  }

  morph(newState) {
    if (!this.isReady) return;
    if (newState === this.currentState) return;

    this.simulationShader.uniforms.uState1.value = this.currentState;
    this.simulationShader.uniforms.uState2.value = newState;
    this.simulationShader.uniforms.uTransition.value = 0;

    this.renderShader.uniforms.uState1.value = this.currentState;
    this.renderShader.uniforms.uState2.value = newState;
    this.renderShader.uniforms.uTransition.value = 0;

    gsap.to(this.simulationShader.uniforms.uTransition, {
      value: 1,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        this.currentState = newState;
        this.simulationShader.uniforms.uState1.value = newState;
        this.simulationShader.uniforms.uTransition.value = 0;
        this.renderShader.uniforms.uState1.value = newState;
        this.renderShader.uniforms.uTransition.value = 0;
      },
    });

    gsap.to(this.renderShader.uniforms.uTransition, {
      value: 1,
      duration: 2,
      ease: "power2.inOut",
    });
  }

  setAmplitude(value, duration = 3) {
    if (!this.isReady) return;
    gsap.to(this.simulationShader.uniforms.amplitude, {
      value: value,
      duration: duration,
    });
  }

  resize() {
    if (!this.isReady) return;
    this.FBO.resize(CONFIG.width, CONFIG.height);
    this.renderShader.uniforms.uPixelRatio.value = Math.min(
      window.devicePixelRatio,
      2
    );
  }

  update() {
    if (!this.isReady) return;
    this.FBO.update();
    this.simulationShader.uniforms.timer.value += 0.01;

    this.FBO.particles.rotation.x =
      ((Math.cos(Date.now() * 0.001) * Math.PI) / 180) * 2;
    this.FBO.particles.rotation.y -= (Math.PI / 180) * 0.05;
  }
}
