import React from "react";
import { ExtrudeGeometryOptions, Shape } from "three";
import { Extrude, Line } from "@react-three/drei";
import { threeSpace } from "../helpers";
import { Config } from "../config";
import { Group, Mesh, BoxGeometry, MeshPhongMaterial } from "../components";
import { range } from "lodash";

export interface SolarProps {
  config: Config;
  activeFocus: string;
}

const panelWidth = 540;
const panelLength = 1040;
const panelRotation: [number, number, number] = [0, Math.PI / 6, 0];
const solarArrayRotation: [number, number, number] = [0, 0, Math.PI];

const cell2D = () => {
  const cellSize = 95;
  const cellBevel = 15;
  const path = new Shape();
  path.moveTo(cellBevel, 0);
  path.lineTo(cellSize - cellBevel, 0);
  path.lineTo(cellSize, cellBevel);
  path.lineTo(cellSize, cellSize - cellBevel);
  path.lineTo(cellSize - cellBevel, cellSize);
  path.lineTo(cellBevel, cellSize);
  path.lineTo(0, cellSize - cellBevel);
  path.lineTo(0, cellBevel);
  return path;
};

const SolarPanel = React.memo(() => {
  const cellSize = 100;
  const cellsWide = Math.floor(panelWidth / cellSize);
  const cellsLong = Math.floor(panelLength / cellSize);
  const cellShape = React.useMemo(() => cell2D(), []);
  const cellArgs = React.useMemo<
    [Shape, ExtrudeGeometryOptions]
  >(() => [
    cellShape,
    { steps: 1, depth: 2, bevelEnabled: false },
  ], [cellShape]);
  const cellMeshes = React.useMemo(() => {
    const cells: React.ReactElement[] = [];
    range(0, cellsWide).forEach(x => {
      range(0, cellsLong).forEach(y => {
        const xPos = x * cellSize - (panelWidth / 2) + 20 + 2.5;
        const yPos = y * cellSize - (panelLength / 2) + 20 + 2.5;
        cells.push(
          <Mesh key={`${x}-${y}`} position={[xPos, yPos, 15]}>
            <Extrude args={cellArgs}>
              <MeshPhongMaterial color={"#131361"} />
            </Extrude>
          </Mesh>);
      });
    });
    return cells;
  }, [cellArgs, cellsLong, cellsWide]);
  const panelArgs = React.useMemo<[number, number, number]>(
    () => [panelWidth, panelLength, 30], []);
  return <Group rotation={panelRotation}>
    <Mesh>
      <BoxGeometry args={panelArgs} />
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    {cellMeshes}
  </Group>;
});

export const Solar = React.memo((props: SolarProps) => {
  const { config } = props;
  const zGround = React.useMemo(
    () => -config.bedZOffset - config.bedHeight,
    [config.bedHeight, config.bedZOffset],
  );
  const showSolar = React.useMemo(
    () => config.solar || props.activeFocus == "What you need to provide",
    [config.solar, props.activeFocus],
  );
  const solarArrayPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(config.bedLengthOuter + 2000, config.bedLengthOuter),
    threeSpace(750, config.bedWidthOuter),
    zGround + 150,
  ]), [config.bedLengthOuter, config.bedWidthOuter, zGround]);
  const panelOffset = React.useMemo<[number, number, number][]>(
    () => [[0, -525, 0], [0, 525, 0]], []);
  const wiringPoints = React.useMemo<[number, number, number][]>(() => ([
    [
      threeSpace(config.bedLengthOuter + 587.5 - config.legSize / 2,
        config.bedLengthOuter),
      threeSpace(config.legSize / 2, config.bedWidthOuter),
      zGround + 20,
    ],
    [
      threeSpace(config.bedLengthOuter + 600, config.bedLengthOuter),
      threeSpace(750, config.bedWidthOuter),
      zGround + 20,
    ],
    [
      threeSpace(config.bedLengthOuter + 2500, config.bedLengthOuter),
      threeSpace(750, config.bedWidthOuter),
      zGround + 20,
    ],
  ]), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.legSize,
    zGround,
  ]);
  return <Group name={"solar"}
    visible={showSolar}>
    <Group name={"solar-array"}
      position={solarArrayPosition}
      rotation={solarArrayRotation}>
      {panelOffset.map((position, index) =>
        <Group key={index} position={position}>
          <SolarPanel />
        </Group>)}
    </Group>
    <Line name={"solar-wiring"}
      points={wiringPoints}
      color={"yellow"}
      lineWidth={5} />
  </Group>;
});
