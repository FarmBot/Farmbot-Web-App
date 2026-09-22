import React from "react";
import * as THREE from "three";
import {
  Extrude, Text3D, useGLTF,
} from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import { ASSETS, LIB_DIR, PartName } from "../../constants";
import {
  Group, Mesh, MeshBasicMaterial, MeshPhongMaterial,
} from "../../components";

type WateringNozzle = GLTF & {
  nodes: { [PartName.wateringNozzle]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

export interface CustomToolModelProps {
  toolName?: string | undefined;
}

const CUSTOM_TOOL_LABEL_RADIUS = 35.2;
const CUSTOM_TOOL_TEXT_RADIUS = 35.3;
const distinguishableBlack = "#333";

export const disableCustomToolRaycast = () => undefined;

const customToolLabelShape = () => {
  const sideInset = 10;
  const halfWidth = CUSTOM_TOOL_LABEL_RADIUS - sideInset;
  const edgeY = Math.sqrt(CUSTOM_TOOL_LABEL_RADIUS ** 2 - halfWidth ** 2);
  const edgeAngle = Math.acos(halfWidth / CUSTOM_TOOL_LABEL_RADIUS);
  const shape = new THREE.Shape();
  shape.moveTo(halfWidth, edgeY);
  shape.absarc(
    0, 0, CUSTOM_TOOL_LABEL_RADIUS,
    edgeAngle, Math.PI - edgeAngle, false);
  shape.lineTo(-halfWidth, -edgeY);
  shape.absarc(
    0, 0, CUSTOM_TOOL_LABEL_RADIUS,
    Math.PI + edgeAngle, 2 * Math.PI - edgeAngle, false);
  shape.closePath();
  return shape;
};

const CUSTOM_TOOL_LABEL_SHAPE = customToolLabelShape();

interface CustomToolNameProps {
  toolName: string;
  centerZ: number;
}

export const curveTextGeometry = (geometry: THREE.BufferGeometry) => {
  if (geometry.userData.customToolCurved) { return; }
  geometry.center();
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const angle = x / CUSTOM_TOOL_TEXT_RADIUS;
    positions.setXYZ(
      index,
      CUSTOM_TOOL_TEXT_RADIUS * Math.sin(angle),
      positions.getY(index),
      z + CUSTOM_TOOL_TEXT_RADIUS * (Math.cos(angle) - 1),
    );
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.userData.customToolCurved = true;
};

const CustomToolName = (props: CustomToolNameProps) => {
  const fontSize = Math.min(6, 65 / props.toolName.length);
  const meshRef = React.useRef<THREE.Mesh>(undefined as unknown as THREE.Mesh);
  React.useLayoutEffect(() => {
    const geometry = meshRef.current?.geometry;
    if (geometry) { curveTextGeometry(geometry); }
  }, [props.toolName]);
  return <Group rotation={[0, 0, Math.PI / 2]}>
    <Text3D name={"custom-tool-name"}
      ref={meshRef}
      position={[0, -CUSTOM_TOOL_TEXT_RADIUS, props.centerZ]}
      rotation={[Math.PI / 2, 0, 0]}
      font={ASSETS.fonts.cabinBold}
      size={fontSize}
      height={0.1}
      curveSegments={8}
      raycast={disableCustomToolRaycast}>
      {props.toolName}
      <MeshBasicMaterial color={distinguishableBlack} />
    </Text3D>
  </Group>;
};

export const CustomToolModel = React.memo((props: CustomToolModelProps) => {
  const wateringNozzle = useGLTF(
    ASSETS.models.wateringNozzle, LIB_DIR) as unknown as WateringNozzle;
  const rotation: [number, number, number] = [0, 0, 2.094 + Math.PI / 2];
  const fillHeight = 12.5;
  const fillCenterZ = 1.25;
  return <>
    <Mesh name={"customTool"}
      position={[
        6.25,
        10.875,
        15,
      ]}
      rotation={rotation}
      scale={1000}
      geometry={wateringNozzle.nodes[PartName.wateringNozzle].geometry}
      material={wateringNozzle.materials.PaletteMaterial001} />
    <Extrude name={"custom-tool-label-base"}
      args={[
        CUSTOM_TOOL_LABEL_SHAPE,
        { depth: fillHeight, bevelEnabled: false, curveSegments: 32 },
      ]}
      rotation={[0, 0, Math.PI / 2]}
      position={[0, 0, -fillHeight / 2 + fillCenterZ]}>
      <MeshPhongMaterial color={"lightgray"} />
    </Extrude>
    {props.toolName &&
      <CustomToolName
        toolName={props.toolName}
        centerZ={fillCenterZ} />}
  </>;
});
