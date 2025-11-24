import * as THREE from "three";
import Experience from "./Experience.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.canvas = this.experience.canvas;
    this.timeline = this.experience.timeline;
    this.cursorEnabled = false;

    this.lerpVector = new THREE.Vector3();

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      10000
    );
    this.defaultCameraPosition = new THREE.Vector3(0, 0, -400);

    this.instance.position.copy(this.defaultCameraPosition);
    this.instance.lookAt(new THREE.Vector3(0, 0, 0));

    this.lerpVector.copy(this.instance.position);

    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 20500;
    this.controls.enabled = true;
    this.controls.target = new THREE.Vector3(0, 0, 0);

    this.controls.addEventListener("change", () => {
      const pos = this.instance.position;
      const target = this.controls.target;
      console.log(
        `Position: { x: ${Math.round(pos.x)}, y: ${Math.round(
          pos.y
        )}, z: ${Math.round(pos.z)} } | Target: { x: ${Math.round(
          target.x
        )}, y: ${Math.round(target.y)}, z: ${Math.round(target.z)} }`
      );
    });

    // this.controls.mouseButtons = {
    //     LEFT: THREE.MOUSE.ROTATE,
    //     MIDDLE: null,
    //     RIGHT: null,  // Отключает действие для правой кнопки мыши
    // };

    this.controls.enableZoom = false;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();

    this.instance.updateMatrixWorld(); // To be used in projection
  }

  getPosition() {
    return this.instance.position;
  }

  animateCamera(duration, fromProps, toProps) {
    const finalDuration = duration || 1.5;

    return gsap.fromTo(
      this.instance.position,
      { ...fromProps },
      { ...toProps, duration: finalDuration }
    );
  }

  animateCameraTo(toProps, duration = 1.5, ease = "power2.out") {
    return gsap.to(this.instance.position, {
      ...toProps,
      duration: duration,
      ease: ease,
    });
  }
}
