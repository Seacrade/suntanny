import {
  getSphere,
  getCube,
  getYinYang,
  getDNA,
  getHeart,
  getTorus,
  getWave,
} from "./Geometry.js";

self.onmessage = (e) => {
  const { type, config } = e.data;

  if (type === "generate") {
    const count = config.particleCount;
    const sizes = config.sizes;

    try {
      // Sphere
      const sphereData = getSphere(count, sizes.sphere);
      self.postMessage(
        { type: "asset", name: "sphereData", data: sphereData },
        [sphereData.buffer]
      );

      // Cube
      const cubeData = getCube(count, sizes.cube);
      self.postMessage({ type: "asset", name: "cubeData", data: cubeData }, [
        cubeData.positions.buffer,
        cubeData.colors.buffer,
      ]);

      // YinYang
      const yinYangData = getYinYang(count, sizes.yinYang);
      self.postMessage(
        { type: "asset", name: "yinYangData", data: yinYangData },
        [yinYangData.positions.buffer, yinYangData.colors.buffer]
      );

      // Torus
      const torusData = getTorus(count, sizes.torus.radius, sizes.torus.tube);
      self.postMessage({ type: "asset", name: "torusData", data: torusData }, [
        torusData.positions.buffer,
        torusData.colors.buffer,
      ]);

      // DNA
      const dnaData = getDNA(count, sizes.dna.radius, sizes.dna.height);
      self.postMessage({ type: "asset", name: "dnaData", data: dnaData }, [
        dnaData.positions.buffer,
        dnaData.colors.buffer,
      ]);

      // Heart
      const heartData = getHeart(count, sizes.heart);
      self.postMessage({ type: "asset", name: "heartData", data: heartData }, [
        heartData.positions.buffer,
        heartData.colors.buffer,
      ]);

      // Wave
      const waveData = getWave(count, sizes.wave.width, sizes.wave.depth);
      self.postMessage({ type: "asset", name: "waveData", data: waveData }, [
        waveData.positions.buffer,
        waveData.colors.buffer,
      ]);
    } catch (error) {
      console.error("Worker generation error:", error);
    }
  }
};
