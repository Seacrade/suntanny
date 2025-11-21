import * as THREE from "three";
import Experience from "../Experience.js";

import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";

import simVertex from "../Shaders/Particles/simulation.vert";
import simFragment from "../Shaders/Particles/simulation.frag";

import renderVertex from "../Shaders/Particles/render.vert";
import renderFragment from "../Shaders/Particles/render.frag";

import FBO from "../Utils/FBO.js";

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

  makeTexture(g) {
    let vertAmount = g.attributes.position.count;
    let texWidth = Math.ceil(Math.sqrt(vertAmount));
    let texHeight = Math.ceil(vertAmount / texWidth);

    let data = new Float32Array(texWidth * texHeight * 4);

    function shuffleArrayByThree(array) {
      const groupLength = 3;

      let numGroups = Math.floor(array.length / groupLength);

      for (let i = numGroups - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        for (let k = 0; k < groupLength; k++) {
          let temp = array[i * groupLength + k];
          array[i * groupLength + k] = array[j * groupLength + k];
          array[j * groupLength + k] = temp;
        }
      }

      return array;
    }

    shuffleArrayByThree(g.attributes.position.array);

    for (let i = 0; i < vertAmount; i++) {
      //let f = Math.floor(Math.random() * (randomTemp.length / 3) );

      const x = g.attributes.position.array[i * 3 + 0];
      const y = g.attributes.position.array[i * 3 + 1];
      const z = g.attributes.position.array[i * 3 + 2];
      const w = 0;

      //randomTemp.splice(f * 3, 3);

      data[i * 4 + 0] = x;
      data[i * 4 + 1] = y;
      data[i * 4 + 2] = z;
      data[i * 4 + 3] = w;
    }

    let dataTexture = new THREE.DataTexture(
      data,
      texWidth,
      texHeight,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;

    return dataTexture;
  }

  setFBOParticles() {
    // width and height of FBO
    const width = 512;
    const height = 512;

    function parseMesh(g) {
      var vertices = g.vertices;
      var total = vertices.length;
      var size = parseInt(Math.sqrt(total * 4) + 0.5);
      var data = new Float32Array(size * size * 4);
      for (var i = 0; i < total; i++) {
        data[i * 3] = vertices[i].x;
        data[i * 3 + 1] = vertices[i].y;
        data[i * 3 + 2] = vertices[i].z;
      }
      return data;
    }

    //returns an array of random 3D coordinates
    function getRandomData(width, height, size) {
      var len = width * height * 4;
      var data = new Float32Array(len);
      //while( len-- )data[len] = ( Math.random() -.5 ) * size ;
      for (let i = 0; i < len; i++) {
        data[i * 3 + 0] = (Math.random() - 0.5) * size;
        data[i * 3 + 1] = (Math.random() - 0.5) * size;
        data[i * 3 + 2] = (Math.random() - 0.5) * size;
      }

      return data;
    }

    Math.cbrt =
      Math.cbrt ||
      function (x) {
        var y = Math.pow(Math.abs(x), 1 / 3);
        return x < 0 ? -y : y;
      };

    function getPoint(v, size) {
      //the 'discard' method, not the most efficient
      v.x = Math.random() * 2 - 1;
      v.y = Math.random() * 2 - 1;
      v.z = Math.random() * 2 - 1;
      v.w = 0.0;
      if (v.length() > 1) return getPoint(v, size);
      return v.normalize().multiplyScalar(size);
    }

    //returns a Float32Array buffer of spherical 3D points
    function getSphere(count, size) {
      var len = count * 4;
      var data = new Float32Array(len);
      var p = new THREE.Vector3();
      for (var i = 0; i < len; i += 4) {
        getPoint(p, size);
        data[i] = p.x;
        data[i + 1] = p.y;
        data[i + 2] = p.z;
        data[i + 3] = 0.0;
      }
      return data;
    }

    function getCube(count, size) {
      const positions = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);
      const c = new THREE.Color("orangered"); // Orangered cube

      for (let i = 0; i < count; i++) {
        const face = Math.floor(Math.random() * 6);
        let x, y, z;
        const s = size;
        const u = (Math.random() - 0.5) * 2 * s;
        const v = (Math.random() - 0.5) * 2 * s;

        switch (face) {
          case 0:
            x = s;
            y = u;
            z = v;
            break; // Right
          case 1:
            x = -s;
            y = u;
            z = v;
            break; // Left
          case 2:
            x = u;
            y = s;
            z = v;
            break; // Top
          case 3:
            x = u;
            y = -s;
            z = v;
            break; // Bottom
          case 4:
            x = u;
            y = v;
            z = s;
            break; // Front
          case 5:
            x = u;
            y = v;
            z = -s;
            break; // Back
        }

        positions[i * 4 + 0] = x;
        positions[i * 4 + 1] = y;
        positions[i * 4 + 2] = z;
        positions[i * 4 + 3] = 0;

        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      return { positions, colors };
    }

    function getYinYang(count, radius) {
      const positions = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);
      const c = new THREE.Color(0xff0000); // Red

      const smallR = radius / 2;
      const dotR = radius / 8;

      for (let i = 0; i < count; i++) {
        let x, y;
        
        // 1% of particles form the outline ring (Thinner outline)
        if (i < count * 0.01) {
            const theta = Math.random() * Math.PI * 2;
            x = radius * Math.cos(theta);
            y = radius * Math.sin(theta);
        } else {
            while (true) {
              const r = Math.sqrt(Math.random()) * radius;
              const theta = Math.random() * Math.PI * 2;
              x = r * Math.cos(theta);
              y = r * Math.sin(theta);

              const dTop = Math.sqrt(x * x + (y - smallR) ** 2);
              const dBot = Math.sqrt(x * x + (y + smallR) ** 2);

              // Logic based on provided Canvas code (Rendering the 'White' part)
              // Base: Left is White
              let visible = x <= 0;

              // Top Circle (Black) invades Left
              if (dTop < smallR) visible = false;

              // Bottom Circle (White) invades Right
              if (dBot < smallR) visible = true;

              // Top Dot (White) inside Top Circle
              if (dTop < dotR) visible = true;

              // Bottom Dot (Black) inside Bottom Circle
              if (dBot < dotR) visible = false;

              if (!visible) continue;

              break;
            }
        }

        positions[i * 4 + 0] = x;
        positions[i * 4 + 1] = y;
        positions[i * 4 + 2] = 0;
        positions[i * 4 + 3] = 0;

        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      return { positions, colors };
    }

    function getDNA(count, radius, height) {
      const positions = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);
      const c1 = new THREE.Color("cyan");
      const c2 = new THREE.Color("magenta");

      for (let i = 0; i < count; i++) {
        const t = Math.random();
        const angle = t * Math.PI * 8; // 4 turns

        const strand = Math.random() > 0.5 ? 0 : 1;
        const phase = strand === 0 ? 0 : Math.PI;

        const x = Math.cos(angle + phase) * radius;
        const z = Math.sin(angle + phase) * radius;
        const y = (t - 0.5) * height;

        positions[i * 4 + 0] = x;
        positions[i * 4 + 1] = y;
        positions[i * 4 + 2] = z;
        positions[i * 4 + 3] = 0;

        const c = strand === 0 ? c1 : c2;
        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      return { positions, colors };
    }

    function getHeart(count, scale) {
      const positions = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);
      const c = new THREE.Color("hotpink");

      for (let i = 0; i < count; i++) {
        let x, y;
        while (true) {
          x = (Math.random() - 0.5) * 3;
          y = (Math.random() - 0.5) * 3;
          
          // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
          if (Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0) break;
        }

        positions[i * 4 + 0] = x * scale;
        positions[i * 4 + 1] = y * scale;
        positions[i * 4 + 2] = 0;
        positions[i * 4 + 3] = 0;

        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      return { positions, colors };
    }

    function getTorus(count, R, r) {
      const positions = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);
      const c = new THREE.Color("lime");

      for (let i = 0; i < count; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;

        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);

        positions[i * 4 + 0] = x;
        positions[i * 4 + 1] = y;
        positions[i * 4 + 2] = z;
        positions[i * 4 + 3] = 0;

        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      return { positions, colors };
    }

    let data = getSphere(width * height, 128);
    let texture = new THREE.DataTexture(
      data,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType,
      THREE.UVMapping,
      THREE.RepeatWrapping,
      THREE.RepeatWrapping
    );
    texture.needsUpdate = true;

    const cubeData = getCube(width * height, 200);
    const targetTexture = new THREE.DataTexture(
      cubeData.positions,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    targetTexture.minFilter = THREE.NearestFilter;
    targetTexture.magFilter = THREE.NearestFilter;
    targetTexture.needsUpdate = true;

    const yinYangData = getYinYang(width * height, 200);
    const targetTexture2 = new THREE.DataTexture(
      yinYangData.positions,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    targetTexture2.minFilter = THREE.NearestFilter;
    targetTexture2.magFilter = THREE.NearestFilter;
    targetTexture2.needsUpdate = true;

    const torusData = getTorus(width * height, 150, 50);
    const targetTexture3 = new THREE.DataTexture(
      torusData.positions,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    targetTexture3.minFilter = THREE.NearestFilter;
    targetTexture3.magFilter = THREE.NearestFilter;
    targetTexture3.needsUpdate = true;

    const dnaData = getDNA(width * height, 100, 400);
    const targetTexture4 = new THREE.DataTexture(
      dnaData.positions,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    targetTexture4.minFilter = THREE.NearestFilter;
    targetTexture4.magFilter = THREE.NearestFilter;
    targetTexture4.needsUpdate = true;

    const heartData = getHeart(width * height, 150);
    const targetTexture5 = new THREE.DataTexture(
      heartData.positions,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    targetTexture5.minFilter = THREE.NearestFilter;
    targetTexture5.magFilter = THREE.NearestFilter;
    targetTexture5.needsUpdate = true;

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
        uPointSize: { type: "f", value: 180 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColor: { value: new THREE.Color(0.8, 0.5, 0.1) },
        uState1: { type: "i", value: 0 },
        uState2: { type: "i", value: 0 },
        uTransition: { type: "f", value: 0 },
        big: {
          type: "v3",
          value: new THREE.Vector3(207, 221, 212).multiplyScalar(1 / 0xff),
        },
        small: {
          type: "v3",
          value: new THREE.Vector3(213, 239, 229).multiplyScalar(1 / 0xff),
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
      }
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

    //update mesh
    this.simulationShader.uniforms.timer.value += 0.01;
    this.FBO.particles.rotation.x =
      ((Math.cos(Date.now() * 0.001) * Math.PI) / 180) * 2;
    this.FBO.particles.rotation.y -= (Math.PI / 180) * 0.05;
  }
}
