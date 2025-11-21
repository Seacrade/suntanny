import {
  getSphere,
  getCube,
  getYinYang,
  getDNA,
  getHeart,
  getTorus,
} from "./Geometry.js";

self.onmessage = (e) => {
  const { type, config } = e.data;

  if (type === "generate") {
    const count = config.particleCount;
    const sizes = config.sizes;

    // Perform calculations
    const sphereData = getSphere(count, sizes.sphere);
    const cubeData = getCube(count, sizes.cube);
    const yinYangData = getYinYang(count, sizes.yinYang);
    const torusData = getTorus(count, sizes.torus.radius, sizes.torus.tube);
    const dnaData = getDNA(count, sizes.dna.radius, sizes.dna.height);
    const heartData = getHeart(count, sizes.heart);

    // Collect Transferables (buffers) to send without copying
    // Note: sphereData is a Float32Array, so we transfer its buffer.
    // cubeData is { positions, colors }, so we transfer both buffers.
    const transferables = [
      sphereData.buffer,
      cubeData.positions.buffer,
      cubeData.colors.buffer,
      yinYangData.positions.buffer,
      yinYangData.colors.buffer,
      torusData.positions.buffer,
      torusData.colors.buffer,
      dnaData.positions.buffer,
      dnaData.colors.buffer,
      heartData.positions.buffer,
      heartData.colors.buffer,
    ];

    self.postMessage(
      {
        sphereData,
        cubeData,
        yinYangData,
        torusData,
        dnaData,
        heartData,
      },
      transferables
    );
  }
};
