import React from "react";
import { Box, useTexture } from "@react-three/drei";
import { DoubleSide, RepeatWrapping } from "three";
import { ASSETS } from "../constants";
import { threeSpace } from "../helpers";
import { Config } from "../config";
import { Group, MeshPhongMaterial } from "../components";
import { StarterTray, PottedPlant, GreenhouseWall, People } from "./props";

export interface GreenhouseProps {
  config: Config;
  activeFocus: string;
}

const wallLength = 10000;
const wallOffset = 2000;
const shelfThickness = 50;
const shelfHeight = 800;
const shelfDepth = 600;

export const Greenhouse = (props: GreenhouseProps) => {
  const { config } = props;
  const groundZ = -config.bedZOffset - config.bedHeight;

  const shelfWoodTexture = useTexture(ASSETS.textures.wood + "?=shelf");
  shelfWoodTexture.wrapS = RepeatWrapping;
  shelfWoodTexture.wrapT = RepeatWrapping;
  shelfWoodTexture.repeat.set(0.3, 0.3);

  return <Group
    name={"greenhouse-environment"}
    visible={config.scene == "Greenhouse"}>

    <Group
      name={"right-greenhouse-wall"}
      position={[
        threeSpace(-wallOffset, config.bedLengthOuter),
        threeSpace(config.bedWidthOuter + wallOffset, config.bedWidthOuter),
        groundZ,
      ]}>
      <GreenhouseWall />
      <Box
        name={"shelf"}
        castShadow={true}
        receiveShadow={true}
        args={[wallLength, shelfDepth, shelfThickness]}
        position={[wallLength / 2, -shelfDepth / 2, shelfHeight]}>
        <MeshPhongMaterial
          map={shelfWoodTexture}
          color={"#aaa"}
          side={DoubleSide}
        />
      </Box>
      <Group name={"starter-tray-1"}
        position={[2000, -shelfDepth / 2, shelfHeight + 25]}>
        <StarterTray />
      </Group>
      <Group name={"starter-tray-2"}
        position={[3000, -shelfDepth / 2, shelfHeight + 25]}>
        <StarterTray />
      </Group>
    </Group>

    <Group
      name={"left-greenhouse-wall"}
      position={[
        threeSpace(-wallOffset, config.bedLengthOuter),
        threeSpace(config.bedWidthOuter + wallOffset - 10000,
          config.bedWidthOuter),
        groundZ,
      ]}
      rotation={[0, 0, Math.PI / 2]}>
      <GreenhouseWall />
    </Group>

    <People
      activeFocus={props.activeFocus}
      config={config}
      people={[
        {
          url: ASSETS.people.person3,
          offset: [-400, -400],
        },
        {
          url: ASSETS.people.person4Flipped,
          offset: [0, config.bedWidthOuter + 900],
        },
      ]} />

    <Group
      name="potted-plant"
      visible={props.activeFocus == ""}
      position={[
        threeSpace(-1750, config.bedLengthOuter),
        threeSpace(850, -config.bedWidthOuter),
        groundZ,
      ]}>
      <PottedPlant />
    </Group>
  </Group>;
};
