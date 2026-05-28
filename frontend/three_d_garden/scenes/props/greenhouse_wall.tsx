import React from "react";
import {
  DoubleSide,
  Euler,
  InstancedMesh as InstancedMeshType,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import {
  BoxGeometry,
  Group,
  InstancedMesh,
  MeshPhongMaterial,
} from "../../components";
import { RenderOrder } from "../../constants";

const wallLength = 10000;
const wallHeight = 2500;
const glassThickness = 10;

const numWallCols = 8;
const numWallRows = 4;
const wallGap = 20;
const paneWidth = (wallLength - (numWallCols + 1) * wallGap) / numWallCols;
const paneHeight = (wallHeight - (numWallRows + 1) * wallGap) / numWallRows;

const openPanels = [
  { row: 2, col: 1 },
  { row: 2, col: 2 },
  { row: 2, col: 3 },
];

const boxMatrix = (
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
) => new Matrix4().compose(
  new Vector3(...position),
  new Quaternion().setFromEuler(new Euler(...rotation)),
  new Vector3(1, 1, 1),
);

const isOpenPanel = (row: number, col: number) =>
  openPanels.some(panel =>
    panel.row === row &&
    panel.col === col);

const paneMatrices = Array.from({ length: numWallRows * numWallCols },
  (_, index) => {
    const row = Math.floor(index / numWallCols);
    const col = index % numWallCols;
    return boxMatrix([
      wallGap + paneWidth / 2 + col * (paneWidth + wallGap),
      0,
      wallGap + paneHeight / 2 + row * (paneHeight + wallGap),
    ], isOpenPanel(row, col) ? [-Math.PI / 3, 0, 0] : [0, 0, 0]);
  });

const verticalFrameMatrices = Array.from({ length: numWallCols + 1 },
  (_, col) => boxMatrix([
    col * (paneWidth + wallGap) + wallGap / 2,
    0,
    wallHeight / 2,
  ]));

const horizontalFrameMatrices = Array.from({ length: numWallRows + 1 },
  (_, row) => boxMatrix([
    wallLength / 2,
    0,
    wallGap + row * (paneHeight + wallGap) - wallGap / 2,
  ]));

interface GreenhouseWallInstancesProps {
  name: string;
  args: [number, number, number];
  matrices: Matrix4[];
  renderOrder?: number;
  children: React.ReactNode;
}

const GreenhouseWallInstances = (props: GreenhouseWallInstancesProps) => {
  // eslint-disable-next-line no-null/no-null
  const ref = React.useRef<InstancedMeshType>(null);

  React.useEffect(() => {
    const mesh = ref.current;
    if (!mesh) { return; }
    props.matrices.forEach((matrix, index) => {
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [props.matrices]);

  return <InstancedMesh
    ref={ref}
    name={props.name}
    args={[undefined, undefined, props.matrices.length]}
    count={props.matrices.length}
    castShadow={true}
    receiveShadow={true}
    renderOrder={props.renderOrder}>
    <BoxGeometry args={props.args} />
    {props.children}
  </InstancedMesh>;
};

const GreenhouseWallBase = () => {

  return <Group name={"greenhouse-wall"}>
    <GreenhouseWallInstances
      name={"greenhouse-wall-panes"}
      args={[paneWidth, glassThickness, paneHeight]}
      matrices={paneMatrices}
      renderOrder={RenderOrder.one}>
      <MeshPhongMaterial
        color={"#ccffff"}
        side={DoubleSide}
        transparent={true}
        opacity={0.25}
      />
    </GreenhouseWallInstances>
    <GreenhouseWallInstances
      name={"greenhouse-wall-vertical-frames"}
      args={[wallGap, glassThickness, wallHeight]}
      matrices={verticalFrameMatrices}>
      <MeshPhongMaterial
        color={"#999"}
        side={DoubleSide}
      />
    </GreenhouseWallInstances>
    <GreenhouseWallInstances
      name={"greenhouse-wall-horizontal-frames"}
      args={[wallLength, glassThickness, wallGap]}
      matrices={horizontalFrameMatrices}>
      <MeshPhongMaterial
        color={"#999"}
        side={DoubleSide}
      />
    </GreenhouseWallInstances>
  </Group>;
};

export const GreenhouseWall = React.memo(GreenhouseWallBase);
