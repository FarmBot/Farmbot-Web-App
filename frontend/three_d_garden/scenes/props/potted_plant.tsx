/* eslint-disable no-null/no-null */
import React from "react";
import { Billboard, Circle, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  Group, MeshBasicMaterial, MeshPhongMaterial, Mesh, PlaneGeometry,
} from "../../components";
import { RenderOrder } from "../../constants";
import {
  getPlantIconTexture,
  getPlantIconTextureUrl,
  LAVENDER_ICON,
  type PlantIconAtlas,
} from "../../garden/plant_icon_atlas";

const potHeight = 400;
const plantHeight = 500;
const potPoints = [
  new THREE.Vector2(0, 0),
  new THREE.Vector2(0.3, 0),
  new THREE.Vector2(0.35, 0.1),
  new THREE.Vector2(0.25, 0.6),
  new THREE.Vector2(0.3, 0.8),
  new THREE.Vector2(0.4, 1),
  new THREE.Vector2(0.35, 1),
  new THREE.Vector2(0.2, 0.6),
  new THREE.Vector2(0, 0.6),
];
const potGeometry = new THREE.LatheGeometry(potPoints, 32, 0, Math.PI * 2);

export interface PottedPlantProps {
  plantIconAtlas?: PlantIconAtlas;
}

const PottedPlantBase = (props: PottedPlantProps) => {
  const lavenderTextureUrl = getPlantIconTextureUrl(
    LAVENDER_ICON, props.plantIconAtlas);
  const lavenderBaseTexture = useTexture(lavenderTextureUrl);
  const lavenderTexture = React.useMemo(() =>
    getPlantIconTexture(lavenderBaseTexture, LAVENDER_ICON,
      props.plantIconAtlas), [
    lavenderBaseTexture, props.plantIconAtlas,
  ]);

  return <Group name="pot-with-plant">
    <Mesh geometry={potGeometry}
      dispose={null}
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
      <Mesh
        renderOrder={RenderOrder.one}
        position={[0, plantHeight / 2, 0]}>
        <PlaneGeometry args={[plantHeight, plantHeight]} />
        <MeshBasicMaterial
          map={lavenderTexture}
          alphaTest={0.1}
          transparent={true}
          depthWrite={true} />
      </Mesh>
    </Billboard>
  </Group>;
};

export const PottedPlant = React.memo(PottedPlantBase);
