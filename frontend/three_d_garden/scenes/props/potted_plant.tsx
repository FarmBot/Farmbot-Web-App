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
  type PlantIconAtlas,
} from "../../garden/plant_icon_atlas";

const pottedPlantIcon = "/crops/icons/lavender.avif";
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

const POTTED_PLANT_BOUNDS = {
  width: plantHeight,
  height: plantHeight,
  depth: potHeight + plantHeight,
};

export interface PottedPlantProps {
  plantIconAtlas?: PlantIconAtlas;
  size: [number, number, number];
}

const sameSize = (
  prev: [number, number, number],
  next: [number, number, number],
) =>
  prev === next || (
    prev[0] === next[0] &&
    prev[1] === next[1] &&
    prev[2] === next[2]);

export const pottedPlantPropsEqual = (
  prev: PottedPlantProps,
  next: PottedPlantProps,
) =>
  prev.plantIconAtlas === next.plantIconAtlas &&
  sameSize(prev.size, next.size);

const PottedPlantBase = (props: PottedPlantProps) => {
  const plantTextureUrl = getPlantIconTextureUrl(
    pottedPlantIcon, props.plantIconAtlas);
  const basePlantTexture = useTexture(plantTextureUrl);
  const plantTexture = React.useMemo(() =>
    getPlantIconTexture(basePlantTexture, pottedPlantIcon,
      props.plantIconAtlas), [
    basePlantTexture, props.plantIconAtlas,
  ]);
  const scale = React.useMemo(() => [
    props.size[0] / POTTED_PLANT_BOUNDS.width,
    props.size[1] / POTTED_PLANT_BOUNDS.height,
    props.size[2] / POTTED_PLANT_BOUNDS.depth,
  ] as [number, number, number], [props.size]);
  const centerOffset = POTTED_PLANT_BOUNDS.depth / 2;

  return <Group name="pot-with-plant" scale={scale}>
    <Group position={[0, 0, -centerOffset]}>
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
            map={plantTexture}
            alphaTest={0.1}
            transparent={true}
            depthWrite={true} />
        </Mesh>
      </Billboard>
    </Group>
  </Group>;
};

export const PottedPlant = React.memo(PottedPlantBase, pottedPlantPropsEqual);
