import React from "react";
import { RepeatWrapping } from "three";
import { Box } from "@react-three/drei";
import { ASSETS } from "../../constants";
import { threeSpace } from "../../helpers";
import { Config } from "../../config";
import { Group, MeshPhongMaterial } from "../../components";
import { FocusVisibilityGroup } from "../../focus_transition";
import { useTextureVariant } from "../../texture_variants";

export interface DeskProps {
  config: Config;
  activeFocus: string;
}

const deskWidth = 1000;
const deskDepth = 500;
const deskHeight = 550;
const deskOffset = 800;
const deskLegWidth = 50;
const deskWoodDarkness = "#666";

const DESK_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedZOffset",
  "desk",
];

export const deskPropsEqual = (prev: DeskProps, next: DeskProps) =>
  prev.activeFocus === next.activeFocus &&
  DESK_CONFIG_FIELDS.every(field => prev.config[field] === next.config[field]);

const DeskBase = (props: DeskProps) => {
  if (!props.config.desk) { return <></>; }

  return <EnabledDesk {...props} />;
};

const EnabledDesk = (props: DeskProps) => {
  const { config } = props;
  const zGround = -config.bedZOffset - config.bedHeight;
  const deskWoodTexture = useTextureVariant(ASSETS.textures.wood, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.3, 0.3],
  });
  const screenTexture = useTextureVariant(ASSETS.textures.screen, {
    wrapT: RepeatWrapping,
    rotation: Math.PI / 2,
  });
  return <FocusVisibilityGroup name={"desk"}
    visible={props.activeFocus == ""}
    position={[
      threeSpace(config.bedLengthOuter + deskOffset, config.bedLengthOuter),
      threeSpace(config.bedWidthOuter / 2, config.bedWidthOuter),
      zGround,
    ]}>
    <Box
      name={"desk-top"}
      castShadow={true}
      receiveShadow={true}
      args={[deskDepth, deskWidth, 50]}
      position={[0, 0, deskHeight + 25]}>
      <MeshPhongMaterial map={deskWoodTexture} color={deskWoodDarkness} />
    </Box>
    <Group name={"desk-legs"}>
      {[
        [(-deskDepth + deskLegWidth) / 2, (-deskWidth + deskLegWidth) / 2],
        [(-deskDepth + deskLegWidth) / 2, (deskWidth - deskLegWidth) / 2],
        [(deskDepth - deskLegWidth) / 2, (-deskWidth + deskLegWidth) / 2],
        [(deskDepth - deskLegWidth) / 2, (deskWidth - deskLegWidth) / 2],
      ].map(([xOffset, yOffset], index) =>
        <Box
          name={"desk-leg"}
          key={index}
          castShadow={true}
          receiveShadow={true}
          args={[deskLegWidth, deskLegWidth, deskHeight]}
          position={[xOffset, yOffset, deskHeight / 2]}>
          <MeshPhongMaterial map={deskWoodTexture} color={deskWoodDarkness} />
        </Box>)}
    </Group>
    <Group name={"laptop"}
      position={[0, 0, deskHeight + 50]}>
      <Group name={"laptop-bottom"}
        position={[0, 0, 5]}>
        <Box
          name={"base"}
          receiveShadow={true}
          args={[200, 300, 10]}>
          <MeshPhongMaterial color={"#222"} />
        </Box>
        <Box
          name={"keyboard"}
          receiveShadow={true}
          args={[100, 260, 10]}
          position={[-30, 0, 1]}>
          <MeshPhongMaterial color={"#333"} />
        </Box>
        <Box
          name={"trackpad"}
          receiveShadow={true}
          args={[50, 100, 10]}
          position={[60, 0, 1]}>
          <MeshPhongMaterial color={"#333"} />
        </Box>
      </Group>
      <Group name={"laptop-lid"}
        position={[-137, 0, 75]}
        rotation={[0, Math.PI / 3, 0]}>
        <Box
          name={"base"}
          castShadow={true}
          receiveShadow={true}
          args={[200, 300, 10]}>
          <MeshPhongMaterial color={"#222"} />
        </Box>
        <Box
          name={"screen"}
          castShadow={true}
          receiveShadow={true}
          args={[140, 260, 10]}
          position={[-10, 0, 1]}>
          <MeshPhongMaterial map={screenTexture} color={"#888"} />
        </Box>
      </Group>
    </Group>
  </FocusVisibilityGroup>;
};

export const Desk = React.memo(DeskBase, deskPropsEqual);
