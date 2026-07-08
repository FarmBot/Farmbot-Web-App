import React from "react";
import { RepeatWrapping } from "three";
import { Box } from "@react-three/drei";
import { ASSETS } from "../../constants";
import { Group, MeshPhongMaterial } from "../../components";
import { FocusVisibilityGroup } from "../../focus_transition";
import { useTextureVariant } from "../../texture_variants";

export interface DeskProps {
  activeFocus: string;
  size: [number, number, number];
}

const deskWidth = 1000;
const deskDepth = 500;
const deskHeight = 550;
const deskLegWidth = 50;
const deskWoodDarkness = "#666";

export const deskPropsEqual = (prev: DeskProps, next: DeskProps) =>
  prev.activeFocus === next.activeFocus &&
  prev.size[0] === next.size[0] &&
  prev.size[1] === next.size[1] &&
  prev.size[2] === next.size[2];

const DESK_BOUNDS = {
  width: deskDepth,
  height: deskWidth,
  depth: deskHeight + 50,
};

const DeskBase = (props: DeskProps) => {
  const deskWoodTexture = useTextureVariant(ASSETS.textures.wood, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.3, 0.3],
  });
  const size = props.size;
  const scale = React.useMemo(() => [
    size[0] / DESK_BOUNDS.width,
    size[1] / DESK_BOUNDS.height,
    size[2] / DESK_BOUNDS.depth,
  ] as [number, number, number], [size]);
  const centerOffset = DESK_BOUNDS.depth / 2;

  return <FocusVisibilityGroup name={"desk"}
    visible={props.activeFocus == ""}>
    <Group scale={scale}>
      <Group position={[0, 0, -centerOffset]}>
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
      </Group>
    </Group>
  </FocusVisibilityGroup>;
};

export const Desk = React.memo(DeskBase, deskPropsEqual);

export const LAPTOP_BOUNDS = {
  width: 337,
  height: 300,
  depth: 200,
};

export interface LaptopProps {
  size: [number, number, number];
}

const sameSize = (
  prev: [number, number, number],
  next: [number, number, number],
) =>
  prev === next || (
    prev[0] === next[0] &&
    prev[1] === next[1] &&
    prev[2] === next[2]);

export const laptopPropsEqual = (prev: LaptopProps, next: LaptopProps) =>
  sameSize(prev.size, next.size);

const LaptopBase = (props: LaptopProps) => {
  const screenTexture = useTextureVariant(ASSETS.textures.screen, {
    wrapT: RepeatWrapping,
    rotation: Math.PI / 2,
  });
  const scale = React.useMemo(() => [
    props.size[0] / LAPTOP_BOUNDS.width,
    props.size[1] / LAPTOP_BOUNDS.height,
    props.size[2] / LAPTOP_BOUNDS.depth,
  ] as [number, number, number], [props.size]);
  const centerOffset = LAPTOP_BOUNDS.depth / 2;

  return <Group name={"laptop"} scale={scale}>
    <Group position={[0, 0, -centerOffset]}>
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
  </Group>;
};

export const Laptop = React.memo(LaptopBase, laptopPropsEqual);
