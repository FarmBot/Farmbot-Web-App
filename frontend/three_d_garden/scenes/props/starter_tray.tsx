import React from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  InstancedMesh as InstancedMeshType,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { RenderOrder } from "../../constants";
import {
  BoxGeometry,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneGeometry,
} from "../../components";
import { range } from "lodash";
import {
  GENERIC_PLANT_ICON,
  getPlantIconTexture,
  getPlantIconTextureUrl,
  type PlantIconAtlas,
} from "../../garden/plant_icon_atlas";

const cellSize = 50;
const seedlingSize = 40;

interface StarterTrayDimensions {
  width: number;
  length: number;
  height: number;
  seedlingSize: number;
}

export interface StarterTraysProps {
  positions: [number, number, number][];
  plantIconAtlas?: PlantIconAtlas;
  dimensions: StarterTrayDimensions;
}

const sameDimensions = (
  prev: StarterTrayDimensions,
  next: StarterTrayDimensions,
) =>
  prev === next || (
    prev.width === next.width &&
    prev.length === next.length &&
    prev.height === next.height &&
    prev.seedlingSize === next.seedlingSize);

const samePositions = (
  prev: StarterTraysProps["positions"],
  next: StarterTraysProps["positions"],
) =>
  prev.length === next.length &&
  prev.every((position, index) =>
    position[0] === next[index][0] &&
    position[1] === next[index][1] &&
    position[2] === next[index][2]);

export const starterTraysPropsEqual = (
  prev: StarterTraysProps,
  next: StarterTraysProps,
) =>
  samePositions(prev.positions, next.positions) &&
  prev.plantIconAtlas === next.plantIconAtlas &&
  sameDimensions(prev.dimensions, next.dimensions);

const tileCells = (dimensions: StarterTrayDimensions) => {
  const cols = Math.max(1, Math.floor(dimensions.width / cellSize));
  const rows = Math.max(1, Math.floor(dimensions.length / cellSize));
  return range(rows).flatMap(row =>
    range(cols).map(col => ({
      x: -(cols - 1) * cellSize / 2 + col * cellSize,
      y: -(rows - 1) * cellSize / 2 + row * cellSize,
    })));
};

const StarterTraysBase = (props: StarterTraysProps) => {
  return props.positions.length == 0
    ? <></>
    : <EnabledStarterTrays {...props} />;
};

const EnabledStarterTrays = (props: StarterTraysProps) => {
  // eslint-disable-next-line no-null/no-null
  const trayRef = React.useRef<InstancedMeshType>(null);
  // eslint-disable-next-line no-null/no-null
  const seedlingRef = React.useRef<InstancedMeshType>(null);
  const plantTextureUrl = getPlantIconTextureUrl(
    GENERIC_PLANT_ICON, props.plantIconAtlas);
  const basePlantTexture = useTexture(plantTextureUrl);
  const plantTexture = React.useMemo(() =>
    getPlantIconTexture(basePlantTexture, GENERIC_PLANT_ICON,
      props.plantIconAtlas), [
    basePlantTexture, props.plantIconAtlas,
  ]);
  const matrix = React.useMemo(() => new Matrix4(), []);
  const position = React.useMemo(() => new Vector3(), []);
  const scaleVector = React.useMemo(() => new Vector3(), []);
  const trayQuaternion = React.useMemo(() => new Quaternion(), []);
  const seedlingQuaternion = React.useMemo(() => new Quaternion(), []);
  const lastCameraQuaternion = React.useMemo(() => new Quaternion(), []);
  const seedlingMatrixNeedsUpdate = React.useRef(true);
  const hasCameraQuaternion = React.useRef(false);
  const dimensions = props.dimensions;
  const trayCells = React.useMemo(() => tileCells(dimensions), [dimensions]);

  React.useEffect(() => {
    const mesh = trayRef.current;
    if (!mesh) { return; }
    props.positions.forEach((trayPosition, index) => {
      position.set(
        trayPosition[0],
        trayPosition[1],
        trayPosition[2] + dimensions.height / 2,
      );
      scaleVector.set(1, 1, 1);
      matrix.compose(position, trayQuaternion, scaleVector);
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [dimensions.height, matrix, position, props.positions, scaleVector,
    trayQuaternion]);

  React.useEffect(() => {
    seedlingMatrixNeedsUpdate.current = true;
  }, [dimensions, props.positions]);

  useFrame(state => {
    const mesh = seedlingRef.current;
    if (!mesh) { return; }
    const cameraChanged = !hasCameraQuaternion.current
      || !lastCameraQuaternion.equals(state.camera.quaternion);
    if (!seedlingMatrixNeedsUpdate.current && !cameraChanged) { return; }
    seedlingQuaternion.copy(state.camera.quaternion);
    scaleVector.set(
      dimensions.seedlingSize,
      dimensions.seedlingSize,
      dimensions.seedlingSize,
    );
    props.positions.forEach((trayPosition, trayIndex) => {
      trayCells.forEach((cell, cellIndex) => {
        const index = trayIndex * trayCells.length + cellIndex;
        position.set(
          trayPosition[0] + cell.x,
          trayPosition[1] + cell.y,
          trayPosition[2] + dimensions.height + dimensions.seedlingSize / 2,
        );
        matrix.compose(position, seedlingQuaternion, scaleVector);
        mesh.setMatrixAt(index, matrix);
      });
    });
    mesh.instanceMatrix.needsUpdate = true;
    lastCameraQuaternion.copy(state.camera.quaternion);
    hasCameraQuaternion.current = true;
    seedlingMatrixNeedsUpdate.current = false;
  });

  return <Group name={"starter-trays"}>
    <InstancedMesh
      ref={trayRef}
      name={"starter-tray-bases"}
      args={[undefined, undefined, props.positions.length]}
      count={props.positions.length}
      castShadow={true}
      receiveShadow={true}
      frustumCulled={false}>
      <BoxGeometry
        args={[
          dimensions.width,
          dimensions.length,
          dimensions.height,
        ]} />
      <MeshPhongMaterial color={"#434343"} side={DoubleSide} />
    </InstancedMesh>
    <InstancedMesh
      ref={seedlingRef}
      name={"starter-tray-seedlings"}
      args={[undefined, undefined, props.positions.length * trayCells.length]}
      count={props.positions.length * trayCells.length}
      frustumCulled={false}
      renderOrder={RenderOrder.one}>
      <PlaneGeometry args={[1, 1]} />
      <MeshBasicMaterial
        map={plantTexture}
        alphaTest={0.1}
        transparent={true} />
    </InstancedMesh>
  </Group>;
};

export const StarterTrays = React.memo(
  StarterTraysBase,
  starterTraysPropsEqual,
);

export interface StarterTrayProps {
  plantIconAtlas?: PlantIconAtlas;
  size: [number, number, number];
}

export const StarterTray = (props: StarterTrayProps) => {
  const dimensions = React.useMemo(() => {
    const effectiveSeedlingSize = Math.max(
      1,
      Math.min(seedlingSize, props.size[2] - 1),
    );
    return {
      width: props.size[0],
      length: props.size[1],
      height: props.size[2] - effectiveSeedlingSize,
      seedlingSize: effectiveSeedlingSize,
    };
  }, [props.size]);
  const centerOffset = props.size[2] / 2;

  return <Group name={"starter-tray"}>
    <Group position={[0, 0, -centerOffset]}>
      <StarterTrays
        positions={[[0, 0, 0]]}
        plantIconAtlas={props.plantIconAtlas}
        dimensions={dimensions} />
    </Group>
  </Group>;
};
