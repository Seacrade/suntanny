// Removed THREE import to save memory in Worker
// import * as THREE from "three";

const COLORS = {
  orangered: { r: 1, g: 0.27, b: 0 },
  white: { r: 1, g: 1, b: 1 },
  black: { r: 0, g: 0, b: 0 },
  cyan: { r: 0, g: 1, b: 1 },
  magenta: { r: 1, g: 0, b: 1 },
  hotpink: { r: 1, g: 0.41, b: 0.71 },
  lime: { r: 0, g: 1, b: 0 },
};

function getPoint(size) {
  let x, y, z, len;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    len = x * x + y * y + z * z;
  } while (len > 1 || len === 0);

  const s = size / Math.sqrt(len);
  return { x: x * s, y: y * s, z: z * s };
}

export function getSphere(count, size) {
  var len = count * 4;
  var data = new Float32Array(len);
  for (var i = 0; i < len; i += 4) {
    const p = getPoint(size);
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
  const c = COLORS.orangered;

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
  const c = { r: 1, g: 0, b: 0 }; // Red

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

// DNA Removed

export function getHeart(count, scale) {
  const positions = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);
  const c = COLORS.hotpink;

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
  const c1 = COLORS.cyan;
  const c2 = COLORS.magenta;

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

    // Mix colors like the DNA used to
    const c = Math.random() > 0.5 ? c1 : c2;
    colors[i * 3 + 0] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  return { positions, colors };
}

export function getWave(count, width, depth) {
  const positions = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);
  const white = { r: 1, g: 1, b: 1 };

  const AMOUNTX = Math.ceil(Math.sqrt(count));
  const AMOUNTY = Math.ceil(count / AMOUNTX);

  const stepX = width / AMOUNTX;
  const stepZ = depth / AMOUNTY;

  for (let i = 0; i < count; i++) {
    const ix = i % AMOUNTX;
    const iy = Math.floor(i / AMOUNTX);

    const x = (ix - AMOUNTX / 2) * stepX;
    const z = (iy - AMOUNTY / 2) * stepZ;
    const y = 0;

    positions[i * 4 + 0] = x;
    positions[i * 4 + 1] = y;
    positions[i * 4 + 2] = z;
    positions[i * 4 + 3] = 0;

    colors[i * 3 + 0] = white.r;
    colors[i * 3 + 1] = white.g;
    colors[i * 3 + 2] = white.b;
  }
  return { positions, colors };
}
