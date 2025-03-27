import React, { useMemo } from "react";
import { Billboard, Circle, Image } from "@react-three/drei";
import * as THREE from "three";
import { Group, MeshPhongMaterial, Mesh } from "../../components";
import { RenderOrder } from "../../constants";

const potHeight = 400;
const plantHeight = 500;

export const PottedPlant = () => {
  const points = useMemo(() => [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.3, 0),
    new THREE.Vector2(0.35, 0.1),
    new THREE.Vector2(0.25, 0.6),
    new THREE.Vector2(0.3, 0.8),
    new THREE.Vector2(0.4, 1),
    new THREE.Vector2(0.35, 1),
    new THREE.Vector2(0.2, 0.6),
    new THREE.Vector2(0, 0.6),
  ], []);

  const geometry = useMemo(() =>
    new THREE.LatheGeometry(points, 32, 0, Math.PI * 2), [points]);

  return <Group name="pot-with-plant">
    <Mesh geometry={geometry}
      scale={[potHeight, potHeight, potHeight]}
      rotation={[Math.PI / 2, 0, 0]}
      receiveShadow={true}>
      <MeshPhongMaterial color="#E2725B" />
    </Mesh>
    <Circle args={[potHeight * 0.35, 16]}
      position={[0, 0, potHeight * 0.9]}>
      <MeshPhongMaterial color="#3A1502" />
    </Circle>
    <Billboard follow={true} position={[0, 0, potHeight - plantHeight / 8]}>
      <Image
        url={"/crops/icons/lavender.avif"}
        scale={plantHeight}
        transparent={true}
        renderOrder={RenderOrder.one}
        position={[0, plantHeight / 2, 0]}
      />
    </Billboard>
  </Group>;
};
