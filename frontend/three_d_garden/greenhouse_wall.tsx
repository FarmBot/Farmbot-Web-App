import React from "react";
import { Box } from "@react-three/drei";
import { DoubleSide } from "three";
import { Group, MeshPhongMaterial } from "./components";

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

  return (
    <Group
      name={"greenhouse-wall"}>
      {Array.from({ length: numWallRows }).map((_, row) =>
        Array.from({ length: numWallCols }).map((_, col) => {
          const isOpen = openPanels.some(
            (panel) => panel.row === row && panel.col === col,
          );
          return (
            <Box
              castShadow={true}
              receiveShadow={true}
              renderOrder={1}
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
            </Box>
          );
        }),
      )}
      {Array.from({ length: numWallCols + 1 }).map((_, col) => (
        <Box
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
      {Array.from({ length: numWallRows + 1 }).map((_, row) => (
        <Box
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
    </Group>
  );
};
