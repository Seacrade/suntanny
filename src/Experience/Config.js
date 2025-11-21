import * as THREE from "three";

export const CONFIG = {
  width: 512,
  height: 512,
  get particleCount() {
    return this.width * this.height;
  },
  colors: {
    primary: new THREE.Color(0.8, 0.5, 0.1),
    big: new THREE.Vector3(207, 221, 212).multiplyScalar(1 / 0xff),
    small: new THREE.Vector3(213, 239, 229).multiplyScalar(1 / 0xff),
  },
  sizes: {
    point: 180,
    sphere: 128,
    cube: 200,
    yinYang: 200,
    torus: { radius: 150, tube: 50 },
    dna: { radius: 100, height: 400 },
    heart: 150,
  },
};
