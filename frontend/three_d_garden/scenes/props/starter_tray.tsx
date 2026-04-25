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
import { ASSETS, RenderOrder } from "../../constants";
import {
  BoxGeometry,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneGeometry,
} from "../../components";
import { range } from "lodash";

const length = 250;
const width = 700;
const height = 50;
const cellSize = 50;
const seedlingSize = 40;
const trayCells = range(5).flatMap(row =>
  range(14).map(col => ({
    x: -width / 2 + cellSize / 2 + col * cellSize,
    y: -length / 2 + cellSize / 2 + row * cellSize,
  })));

export interface StarterTraysProps {
  positions: [number, number, number][];
}

export const StarterTrays = (props: StarterTraysProps) => {
  // eslint-disable-next-line no-null/no-null
  const trayRef = React.useRef<InstancedMeshType>(null);
  // eslint-disable-next-line no-null/no-null
  const seedlingRef = React.useRef<InstancedMeshType>(null);
  const plantTexture = useTexture(ASSETS.other.plant);
  const matrix = React.useMemo(() => new Matrix4(), []);
  const position = React.useMemo(() => new Vector3(), []);
  const scale = React.useMemo(() => new Vector3(), []);
  const trayQuaternion = React.useMemo(() => new Quaternion(), []);
  const seedlingQuaternion = React.useMemo(() => new Quaternion(), []);

  React.useEffect(() => {
    const mesh = trayRef.current;
    if (!mesh) { return; }
    props.positions.forEach((trayPosition, index) => {
      position.set(
        trayPosition[0],
        trayPosition[1],
        trayPosition[2] + height / 2,
      );
      scale.set(1, 1, 1);
      matrix.compose(position, trayQuaternion, scale);
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrix, position, props.positions, scale, trayQuaternion]);

  useFrame(state => {
    const mesh = seedlingRef.current;
    if (!mesh) { return; }
    seedlingQuaternion.copy(state.camera.quaternion);
    scale.set(seedlingSize, seedlingSize, seedlingSize);
    props.positions.forEach((trayPosition, trayIndex) => {
      trayCells.forEach((cell, cellIndex) => {
        const index = trayIndex * trayCells.length + cellIndex;
        position.set(
          trayPosition[0] + cell.x,
          trayPosition[1] + cell.y,
          trayPosition[2] + height + seedlingSize / 2,
        );
        matrix.compose(position, seedlingQuaternion, scale);
        mesh.setMatrixAt(index, matrix);
      });
    });
    mesh.instanceMatrix.needsUpdate = true;
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
      <BoxGeometry args={[width, length, height]} />
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

export const StarterTray = () => {

  return <Group name={"starter-tray"}>
    <StarterTrays positions={[[0, 0, 0]]} />
  </Group>;
};
