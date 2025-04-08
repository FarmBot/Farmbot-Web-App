import React from "react";
import { Box, Billboard, Image } from "@react-three/drei";
import { DoubleSide } from "three";
import { ASSETS, RenderOrder } from "../../constants";
import { Group, MeshPhongMaterial } from "../../components";
import { range } from "lodash";

const length = 250;
const width = 700;
const height = 50;
const cellSize = 50;
const seedlingSize = 40;

export const StarterTray = () => {

  return <Group name={"starter-tray"}>
    <Box
      castShadow={true}
      receiveShadow={true}
      args={[width, length, height]}
      position={[0, 0, height / 2]}>
      <MeshPhongMaterial color={"#434343"} side={DoubleSide} />
    </Box>
    {range(5).map(row =>
      range(14).map(col => {
        const x = -width / 2 + cellSize / 2 + col * cellSize;
        const y = -length / 2 + cellSize / 2 + row * cellSize;
        return <Billboard key={`${row}-${col}`}
          follow={true}
          position={[x, y, height + seedlingSize / 2]}>
          <Image
            url={ASSETS.other.plant}
            scale={seedlingSize}
            renderOrder={RenderOrder.one}
            transparent={true} />
        </Billboard>;
      }),
    )}
  </Group>;
};
