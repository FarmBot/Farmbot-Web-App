import React from "react";
import { Box } from "@react-three/drei";
import { DoubleSide } from "three";
import { Group, MeshPhongMaterial } from "../../components";
import { range } from "lodash";
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

export const GreenhouseWall = () => {

  return <Group
    name={"greenhouse-wall"}>
    {range(numWallRows).map(row =>
      range(numWallCols).map(col => {
        const isOpen = openPanels.some(panel =>
          panel.row === row &&
          panel.col === col,
        );
        return <Box key={`${row}-${col}`}
          castShadow={true}
          receiveShadow={true}
          renderOrder={RenderOrder.one}
          args={[paneWidth, glassThickness, paneHeight]}
          position={[
            wallGap + paneWidth / 2 + col * (paneWidth + wallGap),
            0,
            wallGap + paneHeight / 2 + row * (paneHeight + wallGap),
          ]}
          rotation={isOpen ? [-Math.PI / 3, 0, 0] : [0, 0, 0]}>
          <MeshPhongMaterial
            color={"#ccffff"}
            side={DoubleSide}
            transparent={true}
            opacity={0.25}
          />
        </Box>;
      }),
    )}
    {range(numWallCols + 1).map(col => (
      <Box key={col}
        castShadow={true}
        receiveShadow={true}
        args={[wallGap, glassThickness, wallHeight]}
        position={[
          col * (paneWidth + wallGap) + wallGap / 2,
          0,
          wallHeight / 2,
        ]}>
        <MeshPhongMaterial
          color={"#999"}
          side={DoubleSide}
        />
      </Box>
    ))}
    {range(numWallRows + 1).map(row => (
      <Box key={row}
        castShadow={true}
        receiveShadow={true}
        args={[wallLength, glassThickness, wallGap]}
        position={[
          wallLength / 2,
          0,
          wallGap + row * (paneHeight + wallGap) - wallGap / 2,
        ]}>
        <MeshPhongMaterial
          color={"#999"}
          side={DoubleSide}
        />
      </Box>
    ))}
  </Group>;
};
