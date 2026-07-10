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

const wallGap = 20;
const paneWidth = 1227.5;
const paneHeight = 600;

const openPanels = [
  { row: 2, col: 1 },
  { row: 2, col: 2 },
  { row: 2, col: 3 },
];

const boxMatrix = (
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
) => new Matrix4().compose(
  new Vector3(...position),
  new Quaternion().setFromEuler(new Euler(...rotation)),
  new Vector3(...scale),
);

const isOpenPanel = (row: number, col: number) =>
  openPanels.some(panel =>
    panel.row === row &&
    panel.col === col);

interface Panel {
  center: number;
  size: number;
}

const panels = (size: number, paneSize: number): Panel[] => {
  const availableSize = Math.max(1, size - 2 * wallGap);
  const fullPanelCount = Math.max(
    1,
    Math.floor((availableSize + wallGap) / (paneSize + wallGap)),
  );
  const panelStart = -size / 2 + wallGap;
  const fullPanels = Array.from({ length: fullPanelCount })
    .reduce<Panel[]>((accumulator, _value, index) => {
      const usedSize = accumulator
        .reduce((sum, panel) => sum + panel.size, 0)
        + index * wallGap;
      const panelSize = Math.min(paneSize, availableSize - usedSize);
      return panelSize > 0
        ? accumulator.concat([{
          center: panelStart + panelSize / 2
            + index * (paneSize + wallGap),
          size: panelSize,
        }])
        : accumulator;
    }, []);
  const usedSize = fullPanels.reduce((sum, panel) => sum + panel.size, 0)
    + Math.max(0, fullPanels.length - 1) * wallGap;
  const partialPanelSize = availableSize - usedSize - wallGap;
  return partialPanelSize > 0 && fullPanels.length > 0
    ? fullPanels.concat([{
      center: panelStart
        + fullPanels.length * (paneSize + wallGap)
        + partialPanelSize / 2,
      size: partialPanelSize,
    }])
    : fullPanels;
};

const framePositions = (size: number, panelSizes: Panel[]) => {
  const positions = [
    -size / 2 + wallGap / 2,
    ...panelSizes.map(panel => panel.center + panel.size / 2 + wallGap / 2),
  ];
  const lastFrame = size / 2 - wallGap / 2;
  return positions[positions.length - 1] == lastFrame
    ? positions
    : positions.concat([lastFrame]);
};

const buildPaneMatrices = (length: number, height: number) => {
  const cols = panels(length, paneWidth);
  const rows = panels(height, paneHeight);
  return Array.from({ length: rows.length * cols.length },
    (_, index) => {
      const row = Math.floor(index / cols.length);
      const col = index % cols.length;
      return boxMatrix([
        cols[col].center,
        0,
        rows[row].center,
      ], isOpenPanel(row, col) ? [-Math.PI / 3, 0, 0] : [0, 0, 0], [
        cols[col].size / paneWidth,
        1,
        rows[row].size / paneHeight,
      ]);
    });
};

const buildVerticalFrameMatrices = (length: number) => {
  const cols = panels(length, paneWidth);
  return framePositions(length, cols).map(position => boxMatrix([
    position,
    0,
    0,
  ]));
};

const buildHorizontalFrameMatrices = (height: number) => {
  const rows = panels(height, paneHeight);
  return framePositions(height, rows).map(position => boxMatrix([
    0,
    0,
    position,
  ]));
};

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

  React.useLayoutEffect(() => {
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
    frustumCulled={false}
    renderOrder={props.renderOrder}>
    <BoxGeometry args={props.args} />
    {props.children}
  </InstancedMesh>;
};

interface GreenhouseWallProps {
  size: [number, number, number];
}

const GreenhouseWallBase = (props: GreenhouseWallProps) => {
  const [length, thickness, height] = props.size;
  const paneMatrices = React.useMemo(() =>
    buildPaneMatrices(length, height), [length, height]);
  const verticalFrameMatrices = React.useMemo(() =>
    buildVerticalFrameMatrices(length), [length]);
  const horizontalFrameMatrices = React.useMemo(() =>
    buildHorizontalFrameMatrices(height), [height]);

  return <Group name={"greenhouse-wall"}>
    <GreenhouseWallInstances
      name={"greenhouse-wall-panes"}
      args={[paneWidth, thickness, paneHeight]}
      matrices={paneMatrices}
      renderOrder={RenderOrder.one}>
      <MeshPhongMaterial
        color={"#ccffff"}
        side={DoubleSide}
        transparent={true}
        depthWrite={false}
        opacity={0.25}
      />
    </GreenhouseWallInstances>
    <GreenhouseWallInstances
      name={"greenhouse-wall-vertical-frames"}
      args={[wallGap, thickness, height]}
      matrices={verticalFrameMatrices}>
      <MeshPhongMaterial
        color={"#999"}
        side={DoubleSide}
      />
    </GreenhouseWallInstances>
    <GreenhouseWallInstances
      name={"greenhouse-wall-horizontal-frames"}
      args={[length, thickness, wallGap]}
      matrices={horizontalFrameMatrices}>
      <MeshPhongMaterial
        color={"#999"}
        side={DoubleSide}
      />
    </GreenhouseWallInstances>
  </Group>;
};

export const GreenhouseWall = React.memo(GreenhouseWallBase);
