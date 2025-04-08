import React from "react";
import { Box, Extrude, useTexture } from "@react-three/drei";
import { DoubleSide, Shape, RepeatWrapping } from "three";
import { ASSETS } from "../constants";
import { threeSpace } from "../helpers";
import { Config } from "../config";
import { Desk, People } from "./props";
import { Group, MeshPhongMaterial } from "../components";

export interface LabProps {
  config: Config;
  activeFocus: string;
}

const wallLength = 10000;
const wallHeight = 2500;
const wallThickness = 200;
const wallOffset = 2000;
const wallColor = "#f4f4f4";
const shelfThickness = 50;

const wallStructure2D = () => {
  const shape = new Shape();

  shape.moveTo(0, 0);
  shape.lineTo(wallLength, 0);
  shape.lineTo(wallLength, wallThickness);
  shape.lineTo(-wallThickness, wallThickness);
  shape.lineTo(-wallThickness, -wallLength);
  shape.lineTo(0, -wallLength);
  shape.lineTo(0, 0);

  return shape;
};

export const Lab = (props: LabProps) => {
  const { config } = props;
  const groundZ = -config.bedZOffset - config.bedHeight;

  const shelfWoodTexture = useTexture(ASSETS.textures.wood + "?=shelf");
  shelfWoodTexture.wrapS = RepeatWrapping;
  shelfWoodTexture.wrapT = RepeatWrapping;
  shelfWoodTexture.repeat.set(0.3, 0.3);

  return <Group name={"lab-environment"} visible={config.scene == "Lab"}>
    <Group
      name={"lab-walls"}
      position={[
        threeSpace(-wallOffset, config.bedLengthOuter),
        threeSpace(config.bedWidthOuter + wallOffset, config.bedWidthOuter),
        groundZ,
      ]}>
      <Extrude
        name={"walls"}
        castShadow={true}
        receiveShadow={true}
        args={[
          wallStructure2D(),
          { steps: 1, depth: wallHeight, bevelEnabled: false },
        ]}>
        <MeshPhongMaterial color={wallColor} side={DoubleSide} />
      </Extrude>
      {[wallHeight / 2, wallHeight / 3].map((shelfHeight, index) => (
        <Box
          name={"shelf"}
          key={index}
          castShadow={true}
          receiveShadow={true}
          args={[wallLength, wallThickness, shelfThickness]}
          position={[
            wallLength / 2,
            -wallThickness / 2,
            shelfHeight,
          ]}>
          <MeshPhongMaterial
            map={shelfWoodTexture}
            color={"#999"}
            side={DoubleSide} />
        </Box>
      ))}
    </Group>
    <Desk config={config} activeFocus={props.activeFocus} />
    <People
      activeFocus={props.activeFocus}
      config={config}
      people={[
        {
          url: ASSETS.people.person1Flipped,
          offset: [-300, -300],
        },
        {
          url: ASSETS.people.person2Flipped,
          offset: [config.bedLengthOuter / 2, config.bedWidthOuter + 500],
        },
      ]} />
  </Group>;
};
