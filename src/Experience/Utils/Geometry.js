import * as THREE from "three";

function getPoint(v, size) {
  v.x = Math.random() * 2 - 1;
  v.y = Math.random() * 2 - 1;
  v.z = Math.random() * 2 - 1;
  v.w = 0.0;
  if (v.length() > 1) return getPoint(v, size);
  return v.normalize().multiplyScalar(size);
}

export function getSphere(count, size) {
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

export function getCube(count, size) {
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

export function getYinYang(count, radius) {
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

export function getDNA(count, radius, height) {
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

export function getHeart(count, scale) {
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

export function getTorus(count, R, r) {
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
