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
    this.rotationEnabled = false;

    this.init();
  }

  setRotation(enabled) {
    this.rotationEnabled = enabled;
  }

  init() {
    // Initialize Worker
    this.worker = new GeometryWorker();

    this.generatedData = {};
    this.expectedAssets = [
      "sphereData",
      "cubeData",
      "yinYangData",
      "torusData",
      "heartData",
      "waveData",
    ];

    // Listen for results
    this.worker.onmessage = (e) => {
      const { type, name, data } = e.data;
      if (type === "asset") {
        this.generatedData[name] = data;
        this.checkIfReady();
      }
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

  checkIfReady() {
    const keys = Object.keys(this.generatedData);
    if (this.expectedAssets.every((k) => keys.includes(k))) {
      this.handleWorkerData(this.generatedData);
    }
  }

  handleWorkerData(data) {
    const { sphereData, cubeData, yinYangData, torusData, heartData, waveData } = data;

    const width = CONFIG.width;
    const height = CONFIG.height;

    // Create Textures
    const texture = createDataTexture(sphereData, width, height);
    texture.mapping = THREE.UVMapping;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const targetTexture = createDataTexture(cubeData.positions, width, height);
    const targetTexture2 = createDataTexture(yinYangData.positions, width, height);
    const targetTexture3 = createDataTexture(torusData.positions, width, height);
    const targetTexture5 = createDataTexture(heartData.positions, width, height);
    const targetTexture6 = createDataTexture(waveData.positions, width, height);

    this.simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { type: "t", value: texture },
        uTarget: { type: "t", value: targetTexture },
        uTarget2: { type: "t", value: targetTexture2 },
        uTarget3: { type: "t", value: targetTexture3 },
        uTarget5: { type: "t", value: targetTexture5 },
        uTarget6: { type: "t", value: targetTexture6 },
        uState1: { type: "i", value: 6 }, // Start with Wave (6)
        uState2: { type: "i", value: 6 },
        uTransition: { type: "f", value: 0 },
        timer: { type: "f", value: 0 },
        frequency: { type: "f", value: 0.01 },
        amplitude: { type: "f", value: 30 },
        maxDistance: { type: "f", value: 55 },
      },
      vertexShader: simVertex,
      fragmentShader: simFragment,
    });

    this.renderShader = new THREE.ShaderMaterial({
      uniforms: {
        positions: { type: "t", value: null },
        uPointSize: { type: "f", value: CONFIG.sizes.point },
        uPixelRatio: {
          value: Math.min(window.devicePixelRatio, 2) * (window.innerWidth < 768 ? 0.5 : 1),
        },
        uColor: { value: CONFIG.colors.primary },
        uState1: { type: "i", value: 6 }, // Start with Wave (6)
        uState2: { type: "i", value: 6 },
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

    this.FBO = new FBO(width, height, this.renderer, this.simulationShader, this.renderShader);

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
      "aTargetColor5",
      new THREE.BufferAttribute(heartData.colors, 3)
    );
    this.FBO.particles.geometry.setAttribute(
      "aTargetColor6",
      new THREE.BufferAttribute(waveData.colors, 3)
    );

    this.scene.add(this.FBO.particles);

    this.currentState = 6; // Set current state to Wave
    this.isReady = true;

    // Terminate worker as we don't need it anymore
    this.worker.terminate();
  }

  morph(newState, duration = 2, ease = "power2.inOut") {
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
      duration: duration,
      ease: ease,
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
      duration: duration,
      ease: ease,
    });
  }

  setAmplitude(value, duration = 3, ease = "power1.in") {
    if (!this.isReady) return;
    gsap.to(this.simulationShader.uniforms.amplitude, {
      value: value,
      duration: duration,
      ease: ease,
    });
  }

  setColor(color, duration = 1, ease = "power2.inOut") {
    if (!this.isReady) return;

    const targetColor = new THREE.Color(color);

    gsap.to(this.renderShader.uniforms.uColor.value, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: duration,
      ease: ease,
    });
  }

  resize() {
    if (!this.isReady) return;
    this.FBO.resize(CONFIG.width, CONFIG.height);
    this.renderShader.uniforms.uPixelRatio.value =
      Math.min(window.devicePixelRatio, 2) * (window.innerWidth < 768 ? 0.5 : 1);
  }

  update() {
    if (!this.isReady) return;

    this.FBO.update();
    this.simulationShader.uniforms.timer.value += 0.01;

    if (this.rotationEnabled) {
      this.FBO.particles.rotation.x = ((Math.cos(Date.now() * 0.001) * Math.PI) / 180) * 2;
      this.FBO.particles.rotation.y -= (Math.PI / 180) * 0.05;
    } else {
      this.FBO.particles.rotation.x = 0;
      this.FBO.particles.rotation.y = 0;
    }
  }
}
