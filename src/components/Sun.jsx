import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import sunVertexShader from "../Experience/Shaders/Sun/vertex.glsl";
import sunFragmentShader from "../Experience/Shaders/Sun/fragment.glsl";

export function Sun(props) {
  const mesh = useRef();
  // Load the texture. Note: path is relative to the public folder
  const texture = useTexture("/textures/sun/organic.jpg");

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(128, 128) },
      iChannel0: { value: texture },
      // Dummy texture for iChannel1 since we don't have audio analysis yet
      iChannel1: {
        value: new THREE.DataTexture(
          new Uint8Array([0, 0, 0, 0]),
          1,
          1,
          THREE.RGBAFormat
        ),
      },
    }),
    [texture]
  );

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }, [texture]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.material.uniforms.uTime.value =
        state.clock.elapsedTime * 0.1;
      mesh.current.lookAt(state.camera.position);
    }
  });

  return (
    <mesh ref={mesh} {...props}>
      <planeGeometry args={[0.4, 0.4, 128, 128]} />
      <shaderMaterial
        vertexShader={sunVertexShader}
        fragmentShader={sunFragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
