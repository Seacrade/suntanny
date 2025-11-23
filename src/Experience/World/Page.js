import * as THREE from "three";
import Experience from "../Experience.js";
import ParticleSystem from "./ParticleSystem.js";

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

    this.particleSystem = new ParticleSystem(this.experience);
    this.setEvents();
  }

  setEvents() {
    // Mouse events removed for Story Mode
  }

  destroy() {
    // window.removeEventListener("mousedown", this.onMouseDown);
    // window.removeEventListener("mouseup", this.onMouseUp);
    // window.removeEventListener("touchstart", this.onMouseDown);
    // window.removeEventListener("touchend", this.onMouseUp);
  }

  morph(newState, duration = 2, ease = "power2.inOut") {
    this.particleSystem.morph(newState, duration, ease);
  }

  resize() {
    this.particleSystem.resize();
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
    this.particleSystem.update();
  }
}
