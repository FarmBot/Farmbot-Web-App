import React from "react";
import { Shape } from "three";
import { Extrude, Line } from "@react-three/drei";
import { threeSpace } from "../helpers";
import { Config } from "../config";
import { Group, Mesh, BoxGeometry, MeshPhongMaterial } from "../components";

export interface SolarProps {
  config: Config;
  activeFocus: string;
}

const panelWidth = 540;
const panelLength = 1040;

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

const cellArray = () => {
  const cells = [];
  const cellSize = 100;
  const cellsWide = Math.floor(panelWidth / cellSize);
  const cellsLong = Math.floor(panelLength / cellSize);

  for (let x = 0; x < cellsWide; x++) {
    for (let y = 0; y < cellsLong; y++) {
      const xPos = x * cellSize - (panelWidth / 2) + 20 + 2.5;
      const yPos = y * cellSize - (panelLength / 2) + 20 + 2.5;
      cells.push(
        <Mesh key={`${x}-${y}`} position={[xPos, yPos, 15]}>
          <Extrude args={[cell2D(), { steps: 1, depth: 2, bevelEnabled: false }]}>
            <MeshPhongMaterial color={"#131361"} />
          </Extrude>
        </Mesh>);
    }
  }
  return cells;
};

const SolarPanel = () => {
  return <Group rotation={[0, Math.PI / 6, 0]}>
    <Mesh>
      <BoxGeometry args={[panelWidth, panelLength, 30]} />
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    {cellArray()}
  </Group>;
};

export const Solar = (props: SolarProps) => {
  const { config } = props;
  const zGround = -config.bedZOffset - config.bedHeight;
  return <Group name={"solar"}
    visible={config.solar || props.activeFocus == "What you need to provide"}>
    <Group name={"solar-array"}
      position={[
        threeSpace(config.bedLengthOuter + 2000, config.bedLengthOuter),
        threeSpace(750, config.bedWidthOuter),
        zGround + 150,
      ]}
      rotation={[0, 0, Math.PI]}>
      <Group position={[0, -525, 0]}>
        <SolarPanel />
      </Group>
      <Group position={[0, 525, 0]}>
        <SolarPanel />
      </Group>
    </Group>
    <Line name={"solar-wiring"}
      points={[
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
        ]]}
      color={"yellow"}
      lineWidth={5} />
  </Group>;
};
