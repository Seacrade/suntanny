import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Page from "./Page.js";


export default class World {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.html = this.experience.html;
    this.sound = this.experience.sound;
    this.debug = this.experience.debug.panel;

    // Wait for resources
    this.resources.on("ready", () => {
      if (this.html.playButton) this.html.playButton.classList.add("fade-in");

      this.experience.time.start = Date.now();
      this.experience.time.elapsed = 0;

      // Setup
      this.page = new Page();
      this.environment = new Environment();


      this.animationPipeline();
    });
  }
  // Intro animation of splash screen
  animationPipeline() {
    this.camera.animateCamera(
      2.5, // duration
      { z: -3500, x: 100, y: 150 }, // fromProps (start z at -3500)
      { x: -111, y: -111, z: -150, ease: "power4.out" } // toProps (end z at -600 to match Story start)
    );
    //if (this.camera) this.camera.animateCameraPosition();
  }

  resize() {
    if (this.sun) this.sun.resize();
  }

  scroll() {}

  update() {
    if (this.sun) this.sun.update();

    if (this.page) {
      this.page.update();
    }
  }

  destroy() {
    if (this.page) this.page.destroy();
  }
}
