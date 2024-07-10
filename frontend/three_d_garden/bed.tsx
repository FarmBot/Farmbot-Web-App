import React from "react";
import { Box, Extrude } from "@react-three/drei";
import { DoubleSide, Path, Shape } from "three";
import { range } from "lodash";
import { Config } from "./config";
import { Group, MeshPhongMaterial } from "./components";

const soil = (
  Type: typeof Path | typeof Shape,
  botSize: Record<"x" | "y" | "z" | "thickness", number>,
): Path | Shape => {
  const { x, y, thickness } = botSize;

  const hole = new Type();
  hole.moveTo(thickness, thickness);
  hole.lineTo(thickness, y - thickness);
  hole.lineTo(x - thickness, y - thickness);
  hole.lineTo(x - thickness, thickness);
  hole.lineTo(thickness, thickness);
  return hole;
};

const bedStructure2D = (
  botSize: Record<"x" | "y" | "z" | "thickness", number>,
) => {
  const { x, y } = botSize;
  const shape = new Shape();

  // outer edge
  shape.moveTo(0, 0);
  shape.lineTo(0, y);
  shape.lineTo(x, y);
  shape.lineTo(x, 0);
  shape.lineTo(0, 0);

  // inner edge
  shape.holes.push(soil(Path, botSize));

  return shape;
};

export interface BedProps {
  config: Config;
}

export const Bed = (props: BedProps) => {
  const {
    bedWidthOuter, bedLengthOuter, botSizeZ, bedHeight, bedZOffset,
    legSize, legsFlush, extraLegsX, extraLegsY,
    soilHeight, ccSupportSize,
  } = props.config;
  const thickness = props.config.bedWallThickness;
  const botSize = { x: bedLengthOuter, y: bedWidthOuter, z: botSizeZ, thickness };
  const bedStartZ = 0;
  const legXPositions = [
    0 + legSize / 2 + thickness,
    ...(extraLegsX
      ? range(0, bedLengthOuter, bedLengthOuter / (extraLegsX + 1)).slice(1)
      : []),
    bedLengthOuter - legSize / 2 - thickness,
  ];
  const legYPositions = (index: number) =>
    [
      0 + legSize / 2 + thickness,
      ...(extraLegsY && (index == 0 || index == (legXPositions.length - 1))
        ? range(0, bedWidthOuter, bedWidthOuter / (extraLegsY + 1)).slice(1)
        : []),
      bedWidthOuter - legSize / 2 - thickness,
    ];
  const casterHeight = legSize * 1.375;

  const Bed = ({ children }: { children: React.ReactElement }) =>
    <Extrude name={"bed"}
      castShadow={true}
      receiveShadow={true}
      args={[
        bedStructure2D(botSize),
        { steps: 1, depth: bedHeight, bevelEnabled: false },
      ]}
      position={[
        0,
        0,
        -bedStartZ,
      ]}>
      {children}
    </Extrude>;

  const Soil = ({ children }: { children: React.ReactElement }) => {
    const soilDepth = bedHeight + (soilHeight - 50) - soilHeight;
    return <Extrude name={"soil"}
      castShadow={true}
      receiveShadow={true}
      args={[
        soil(Shape, botSize) as Shape,
        { steps: 1, depth: soilDepth, bevelEnabled: false },
      ]}
      position={[
        0,
        0,
        -bedStartZ,
      ]}>
      {children}
    </Extrude>;
  };

  const bedColor = "#ad7039";
  return <Group name={"bed-group"}>
    <Bed>
      <MeshPhongMaterial color={"#ad7039"} side={DoubleSide} />
    </Bed>
    <Box name={"lower-cc-support"}
      castShadow={true}
      receiveShadow={true}
      args={[bedLengthOuter / 2, ccSupportSize, ccSupportSize]}
      position={[
        bedLengthOuter / 4,
        -ccSupportSize / 2,
        -Math.min(150, bedHeight / 2) - ccSupportSize / 2,
      ]}>
      <MeshPhongMaterial color={bedColor} side={DoubleSide} />
    </Box>
    <Box name={"upper-cc-support"}
      castShadow={true}
      receiveShadow={true}
      args={[bedLengthOuter / 2, ccSupportSize, ccSupportSize]}
      position={[
        bedLengthOuter * 3 / 4,
        -ccSupportSize / 2,
        -50 - ccSupportSize / 2,
      ]}>
      <MeshPhongMaterial color={bedColor} side={DoubleSide} />
    </Box>
    <Soil>
      <MeshPhongMaterial color={"#29231e"}
        shininess={0} />
    </Soil>
    {legXPositions.map((x, index) =>
      <Group key={index}>
        {legYPositions(index).map(y => {
          const legTopOffset = legsFlush ? bedHeight / 2 : bedHeight;
          return <Group name={"bed-leg"} key={y}
            position={[
              x,
              y,
              -bedZOffset / 2 - legTopOffset + (casterHeight / 2),
            ]}>
            <Box name={"bed-leg-wood"}
              castShadow={true}
              receiveShadow={true}
              args={[
                legSize,
                legSize,
                bedZOffset + (legsFlush ? bedHeight : 0) - casterHeight,
              ]}>
              <MeshPhongMaterial color={bedColor} />
            </Box>
          </Group>;
        })}
      </Group>)}
  </Group>;
};
