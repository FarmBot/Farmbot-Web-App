import React from "react";
import { Box } from "@react-three/drei";
import { DoubleSide, RepeatWrapping } from "three";
import { ASSETS } from "../constants";
import { threeSpace } from "../helpers";
import { Config } from "../config";
import { Group, MeshPhongMaterial } from "../components";
import { StarterTrays, PottedPlant, GreenhouseWall, People } from "./props";
import { PopInGroup } from "../progressive_load";
import { FocusVisibilityGroup } from "../focus_transition";
import { useTextureVariant } from "../texture_variants";

export interface GreenhouseProps {
  config: Config;
  activeFocus: string;
  reveal?: boolean;
  onDetailsLoadInRest?(): void;
}

const wallLength = 10000;
const wallOffset = 2000;
const shelfThickness = 50;
const shelfHeight = 800;
const shelfDepth = 600;

const GreenhouseBase = (props: GreenhouseProps) => {
  const { config } = props;
  const groundZ = -config.bedZOffset - config.bedHeight;

  const shelfWoodTexture = useTextureVariant(ASSETS.textures.wood, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.3, 0.3],
  });

  return <Group
    name={"greenhouse-environment"}
    visible={config.scene == "Greenhouse"}>
    <PopInGroup
      name={"greenhouse-scene-details-load-in"}
      reveal={props.reveal}
      onRest={props.onDetailsLoadInRest}
      distance={300}>

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
        <StarterTrays positions={[
          [2000, -shelfDepth / 2, shelfHeight + 25],
          [3000, -shelfDepth / 2, shelfHeight + 25],
        ]} />
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

      <FocusVisibilityGroup
        name="potted-plant"
        visible={props.activeFocus == ""}
        position={[
          threeSpace(-1750, config.bedLengthOuter),
          threeSpace(850, -config.bedWidthOuter),
          groundZ,
        ]}>
        <PottedPlant />
      </FocusVisibilityGroup>
    </PopInGroup>
  </Group>;
};

const GREENHOUSE_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedZOffset",
  "people",
  "scene",
];

export const greenhousePropsEqual = (
  prev: GreenhouseProps,
  next: GreenhouseProps,
) =>
  prev.activeFocus === next.activeFocus
  && prev.reveal === next.reveal
  && prev.onDetailsLoadInRest === next.onDetailsLoadInRest
  && GREENHOUSE_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const Greenhouse = React.memo(GreenhouseBase, greenhousePropsEqual);
