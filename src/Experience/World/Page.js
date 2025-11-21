import * as THREE from "three";
import Experience from "../Experience.js";

import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";

import simVertex from "../Shaders/Particles/simulation.vert";
import simFragment from "../Shaders/Particles/simulation.frag";

import renderVertex from "../Shaders/Particles/render.vert";
import renderFragment from "../Shaders/Particles/render.frag";

import FBO from "../Utils/FBO.js";
import {
  getSphere,
  getCube,
  getYinYang,
  getDNA,
  getHeart,
  getTorus,
} from "../Utils/Geometry.js";
import { CONFIG } from "../Config.js";
import { createDataTexture } from "../Utils/TextureHelper.js";

export default class Page {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;
    this.resources = this.experience.resources;
    this.sizes = this.experience.sizes;
    this.timeline = this.experience.timeline;
    this.isMobile = this.experience.isMobile;
    this.cursor = this.experience.cursor;

    this.setFBOParticles();
    this.setEvents();
  }

  setEvents() {
    this.onMouseDown = () => {
      gsap.to(this.simulationShader.uniforms.amplitude, {
        value: 0,
        duration: 3,
      });
    };

    this.onMouseUp = () => {
      gsap.to(this.simulationShader.uniforms.amplitude, {
        value: 248,
        duration: 3,
      });
    };

    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("touchstart", this.onMouseDown);
    window.addEventListener("touchend", this.onMouseUp);
  }

  destroy() {
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("touchstart", this.onMouseDown);
    window.removeEventListener("touchend", this.onMouseUp);
  }

  setFBOParticles() {
    // width and height of FBO
    const width = CONFIG.width;
    const height = CONFIG.height;
    const count = CONFIG.particleCount;

    // Generate Data
    const sphereData = getSphere(count, CONFIG.sizes.sphere);
    const cubeData = getCube(count, CONFIG.sizes.cube);
    const yinYangData = getYinYang(count, CONFIG.sizes.yinYang);
    const torusData = getTorus(
      count,
      CONFIG.sizes.torus.radius,
      CONFIG.sizes.torus.tube
    );
    const dnaData = getDNA(
      count,
      CONFIG.sizes.dna.radius,
      CONFIG.sizes.dna.height
    );
    const heartData = getHeart(count, CONFIG.sizes.heart);

    // Create Textures
    const texture = createDataTexture(sphereData, width, height);
    // Sphere texture needs specific wrapping for some reason in original code, but let's stick to standard for now unless it breaks.
    // Original code had: THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping for sphere.
    // Let's apply that manually if needed, or just use the helper.
    // The original code used a different constructor for the first texture (sphere).
    // Let's replicate that specific behavior for the first texture to be safe.
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
      // depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    // // Initialize the FBO
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

    this.currentState = 0;
  }

  morph(newState) {
    if (newState === this.currentState) return;

    // Set up the transition
    this.simulationShader.uniforms.uState1.value = this.currentState;
    this.simulationShader.uniforms.uState2.value = newState;
    this.simulationShader.uniforms.uTransition.value = 0;

    this.renderShader.uniforms.uState1.value = this.currentState;
    this.renderShader.uniforms.uState2.value = newState;
    this.renderShader.uniforms.uTransition.value = 0;

    // Animate transition
    gsap.to(this.simulationShader.uniforms.uTransition, {
      value: 1,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        this.currentState = newState;
        // Reset for next time (optimization: keep uState1 = newState, uTransition = 0)
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

  resize() {
    this.FBO.resize(this.sizes.width, this.sizes.height);
    this.renderShader.uniforms.uPixelRatio.value = Math.min(
      window.devicePixelRatio,
      2
    );
  }

  setAnimation() {}

  setDebug() {
    // Debug
    if (this.debug.active) {
      //this.debugFolder = this.debug.gui.addFolder('Cube')
      //this.debugFolder.open()
    }
  }

  update() {
    //update simulation
    this.FBO.update();

    // update mesh
    this.simulationShader.uniforms.timer.value += 0.01;

    //object rotation
    this.FBO.particles.rotation.x =
      ((Math.cos(Date.now() * 0.001) * Math.PI) / 180) * 2;
    this.FBO.particles.rotation.y -= (Math.PI / 180) * 0.05;
  }
}
